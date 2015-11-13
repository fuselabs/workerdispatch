var Checkit=require("checkit");

module.exports = function(bookshelf) {
  var Job=bookshelf.Model.extend({
    tableName:'jobs',
    idAttribute:'job_id',
    worker: function(){
      return this.belongsTo(Worker);
    },
    client: function(){
      return this.belongsTo(User);
    }
  });


  var Worker=bookshelf.Model.extend({
    tableName:'workers',
    jobs: function(){
      return this.hasMany(Job);
    },
    clients: function(){
      return this.belongsToMany(User).through(Job);
    }
  });


  var User = bookshelf.Model.extend({
    tableName: 'users',
    workers: function(){
      return this.hasMany(Worker).through(Job);
    },
    jobs: function(){
      return this.hasMany(Job);
    }
  });


  return {
    User: User,
    Job:Job,
    Worker:Worker,
  }
}
