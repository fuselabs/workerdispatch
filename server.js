var http           = require('http'),
    config         = require('./server/config'),
    express        = require('express'),
    bodyParser     = require('body-parser'),
    methodOverride = require('method-override'),
    path           = require('path'),
    knex           = require('knex')(config.knex_options),
    bookshelf      = require('bookshelf')(knex),
    Checkit        = require('checkit'),
    models         = require('./server/models')(bookshelf),
    notifier       = require('./server/notifier'),
    restful        = require('./server/bookshelf_rest'),
    auth           = require('./server/auth')(models),
    force          = require('./server/force')
    ;


/********************* APP SETUP *****************************/

app = express();
server = http.createServer(app);
io = require('socket.io')(server);
// cleanup=restify.createServer();
app.set('bookshelf', bookshelf);
router=express.Router()
// cleanup.pre(restify.pre.sanitizePath());

logger = {
  debug: config.debug,
  warn: config.warn,
  error: config.error
};


app.use(bodyParser());
app.use(methodOverride());

app.use('/client',express.static(path.join(__dirname, 'customerClient/')));
app.use('/worker',express.static(path.join(__dirname, 'workerClient/')));
app.use(express.static(path.join(__dirname, 'admin/')));
app.use(express.static(path.join(__dirname, 'server/pages')));

// Logging
app.use(function(req, res, next) {
  logger.debug(req.method, req.url);
  next();
});

app.use(function(err, req, res, next) {
  logger.error(err.stack);
  res.status(500).send(err.message);
});


/********************* ROUTES *****************************/
app.get('/admin', auth.authenticate, auth.require_admin, function (req, res) {
  "use strict";

  res.set('Location', '/admin_Ypzr9fLs.html');
  return res.send('OK');
});

app.use(/\/(client|worker)\/register/, auth.register);
app.use(/\/(client|worker)\/login/, auth.login);

router.route('/test')
.get(function(req,res){
  "use strict";

  console.log("do something");
});
router.route('/test/:param')
.get(function(req,res){
  "use strict";

  models.Job.forge({id:req.params.param})
  .fetch({withRelated:['worker']})
    .then(function(job_details){
      res.send(job_details);
  })
});

// Worker routing
router.route('/workers')
.get(function(req,res){ // get all workers
  "use strict";

  models.Worker.query().then(function(coll){
    res.json({error:false,data:coll});
  })
})
.post(function(req,res){ // create a new worker
  "use strict";

  models.Worker.forge(req.body).save().then(function(worker){
    res.json({error:false,message:"Worker created!"});
  }).otherwise(function(error){
    console.log(error);
  })
});

router.route("/workers/:workerID")
.get(function(req,res){ // get a single worker
  "use strict";

  models.Worker.forge({id:req.params.workerID})
  .fetch().then(function(worker){
    if (!worker) res.status(404).json({ error:true,data:{} });
    else res.json({error:false,data:worker});
  }).otherwise(function(error){
    console.log(error);
  })
})
.put(function(req,res){ // update a worker
  "use strict";

  models.Worker.forge({id:req.params.workerID})
  .save(req.body,{patch:true}).then(function(worker){
    if (!worker) res.status(404).json({ error:true,data:{} });
    else res.json({error:false,message:'Worker updated',data:worker});
  }).otherwise(function(error){
    console.log(error);
  })
})
.delete(function(req,res){ // delete a worker
  "use strict";

  models.Worker.forge({id:req.params.workerID})
  .destroy().then(function(response){
    if (!worker) res.status(404).json({ error:true,data:{} });
    else res.json({error:false,message:'Worker deleted'});
  }).otherwise(function(error){
    console.log(error);
  })
});
router.route("/workers/:workerID/jobs")
.get(function(req,res){
  "use strict";

  models.Worker.forge({id:req.params.workerID}).jobs().fetch().then(function(jobs){
    res.json({error:false,data:jobs});
  })
});

// Job routing
router.route('/jobs')
.get(function(req,res){ // get all jobs
  "use strict";

  models.Job.query().then(function(coll){
    res.json({error:false,data:coll});
  })
})
.post(function(req,res){ // create a new job
  "use strict";

  models.Job.forge(req.body).save().then(function(job){
    res.json({error:false,message:"Job created!"});
  }).otherwise(function(error){
    console.log(error);
  })
});

router.route("/jobs/:jobID")
.get(function(req,res){ // get a single job
  "use strict";

  models.Job.forge({id:req.params.jobID})
  .fetch({withRelated:['worker']}).then(function(job){
    if (!job) res.status(404).json({ error:true,data:{} });
    else res.json({error:false,data:job});
  }).otherwise(function(error){
    console.log(error);
  })
})
.put(function(req,res){ // update a job
  "use strict";

  models.Job.forge({id:req.params.jobID})
  .save(req.body,{patch:true}).then(function(job){
    if (!job) res.status(404).json({ error:true,data:{} });
    else res.json({error:false,message:'Job updated',data:job});
  }).otherwise(function(error){
    console.log(error);
  })
})
.delete(function(req,res){ // delete a job
  "use strict";

  models.Job.forge({id:req.params.jobID})
  .destroy().then(function(response){
    if (!job) res.status(404).json({ error:true,data:{} });
    else res.json({error:false,message:'Job deleted'});
  }).otherwise(function(error){
    console.log(error);
  })
});

app.use('/api',router);


/********************* NOTIFICATIONS *****************************/

auth.on_register(function(user) {
  "use strict";

  force.create_lead(user.get('name'), user.get('email'));
});

notifier(bookshelf, {
  'questions': function(question_id) {
    new models.Question({
        id: question_id
      })
      .fetch()
      .then(function(question) {
        if (question.get('show')) {
          question.set('answer_index', null);
          question.set('question_index', 0);
          question.set('question_total', 10);
          io.emit('questions', JSON.stringify(question));
        }
      });
  }
})

/********************* SERVER STARTT *****************************/


app.set('port', process.env.PORT || 5000);

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

io.on('connection', function(socket) {
  console.log('a user connected');
});
