angular.module('openMarket.controllers', [])

.controller('AppCtrl', function($scope, $state, $location, RegistrationService) {
  $scope.logout = function() {
    RegistrationService.logout();
    $state.transitionTo("register");
  }
  $scope.timeleft = '0 secs';
})

.controller("AddJobCtrl", function($scope, $state, $ionicPopup, $ionicViewService, $location, $ionicLoading, $stateParams, $http, Worker, User, Job) {
  $scope.user=User;

  $scope.schedule = function() {
    $state.transitionTo("app.schedule");
  };

  $scope.announce=function(){
    console.log("got this")
  }

  if ($scope.user.past_workers.length == 0) {
    if ($scope.user.getUserData().homes.length == 0) {
      $state.transitionTo('app.first_home');
      }
    }

})

.controller('QuoteCtrl', function($scope, $state, $location, $http, Job,User) {
  $scope.Math=window.Math;
  $scope.worker_wage = 25;
  $scope.user=User;
  $scope.job=Job;


  $scope.submitJob = function() { $state.transitionTo("app.waiting"); }
  $scope.cancelJob = function() { $state.transitionTo('app.add_job'); }

})


.controller('SummaryCtrl', function($scope, $state, $location, $http, Job,User) {
  $scope.user=User;
  $scope.jobNotes=Job;

  $scope.feedback = function() { $state.transitionTo('app.review_worker'); }

  $scope.notes = "- did job\n\
  - finished up\n\
  - left keys under mat".replace(/(?:\r\n|\r|\n)/g, '<br />');
})

.controller('RoomCtrl', function($scope, $ionicPopup, $state, $location, $ionicLoading,$ionicViewService, $stateParams, $http, Job, User) {
  $scope.house = {
    "rooms": {
      "bedrooms": {"time to clean": 20 },
      "bathrooms": {"time to clean": 40 },
      "living rooms": {"time to clean": 30 },
      "kitchens": {"time to clean": 60 }
    },
    "address": ''
  };
  $scope.currentUser=User;
  $scope.currentJob=Job;

  $scope.first_time=($scope.currentUser.getUserData().homes.length==0);

  $scope.usableAddress = function(home) {
    if ($scope.house.address.length == 0) {
      return "bar-dark";
    } else {
      if ($scope.user.totalRooms(home) == 0)
        return "bar-stable";
      else
        return "bar-positive";
    }
  }

  $scope.announce = function(thing) {
    console.log(thing);
    console.log($scope.house.totalTime());
  }

  $scope.confirmed=function(home) {
    return $ionicPopup.confirm({
      title: 'finished adding rooms?',
      template: "you only have " + $scope.user.totalRooms(home) + " rooms listed"
    });
  }

  $scope.user = {
    add_home: function(home) {
      $scope.currentUser.addHome(home);
      if ($scope.first_time){
        $scope.currentJob.setHomeData(home);
        $ionicViewService.nextViewOptions({ disableBack: true });
        $state.transitionTo("app.schedule");
      }
    },
    totalTime: function(home) {
      total = 0;
      for (room in home.rooms) {
        total += home.rooms[room]['time to clean'] * home.rooms[room].count;
      }
      return total;
    },
    totalRooms: function(home) {
      total = 0;
      for (room in home.rooms) {
        total += home.rooms[room].count;
      }
      return total;
    }
  };
  $scope.user.data=User;
})


.controller('ErrorCtrl', function($scope, $ionicModal) {
  $ionicModal.fromTemplateUrl("templates/error.html", {
    scope: $scope,
  })
})


.controller('ScheduleCtrl', function($scope, $filter, $state, $ionicPopup, $ionicPopover, $location, $ionicViewService, $ionicLoading, $stateParams, $http, Job, User) {
  $scope.announce = function(times) {
    console.log(times);
  };
  $scope.data = { showDelete: false };
  $scope.job=Job;
  $scope.tentativeJobTimes=new Array();
  $scope.user=User;
  console.log("job info:",$scope.job.getJobData());


  $scope.form={
    datetime: {
      day: $filter("date")(Date.now(), 'yyyy-MM-dd'),
      time: $filter("date")(Date.now() + (60 * 60 * 1000), 'HH:mm'),
    },
  };


  $scope.timeDiff = function(timeStamp) {
    return new Date(timeStamp.getTime()
      + $scope.job.totalTimeInHours()*60000*60);
  };

  $scope.arrange = function(timeToUse) {
    $scope.job.setPreferredTimes($scope.tentativeJobTimes)
    $state.transitionTo('app.cleaning_quote');
  };

  $scope.addTime = function() { // this is a mess and might need to be re-factored someday
    fixed = $scope.form.datetime.day + " " + $scope.form.datetime.time;
    conc = fixed.split(/[- :]/);
    fixed = new Date(conc[0], conc[1] - 1, conc[2], conc[3], conc[4]);

    if (fixed > new Date()) {
      $scope.tentativeJobTimes.push(fixed);
      $scope.tentativeJobTimes.sort(function(a, b) {
        return new Date(a) - new Date(b);
      });
    } else {
      $ionicPopup.alert({
        title: "job in the past?",
        content: "the time you selected appears to be in the past; select future times only"
      });
    }
  };

  $scope.jobOptions = function() {
    switch (true) {
      case $scope.job.getPreferredTimes().length < 3:
        classVal = "bar-stable";
        break;
      case $scope.job.getPreferredTimes().length < 5:
        classVal = "bar-positive";
        break;
      case $scope.job.getPreferredTimes().length >= 7:
        classVal = "bar-balanced";
        break;
    }
    return classVal;
  };

  $scope.removeTime = function(badTime) {
    $scope.tentativeJobTimes.splice(badTime, 1);
    if ($scope.tentativeJobTimes.length == 0) $scope.data.showDelete = false;
  };

  $scope.showTimePopup = function() {
    var myTemplate = '' +
      '<label class="item item-input">' +
      '<span class="input-label">Date</span>' +
      '<input ng-model="form.datetime.day" type="date" min="2015-08-15">' +
      '</label>' +
      '<label class="item item-input">' +
      '<span class="input-label">Time</span>' +
      '<input ng-model="form.datetime.time" type="time">' +
      '</label>'

    // An elaborate, custom popup
    var myPopup = $ionicPopup.show({
      template: myTemplate,
      title: 'Add a possible time',
      subTitle: 'When are you available for your cleaning?',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Save</b>',
          type: 'button-positive',
          onTap: function(e) {
            $scope.addTime();
          }
        }
      ]
    });
  }

  var template = '<ion-popover-view><ion-header-bar> <h1 class="title">My Popover Title</h1> </ion-header-bar> <ion-content> Hello! </ion-content></ion-popover-view>';

  $scope.popover = $ionicPopover.fromTemplate(template, {
    scope: $scope
  });
  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };
  $scope.closePopover = function() {
    $scope.popover.hide();
  };
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });
  // Execute action on hide popover
  $scope.$on('popover.hidden', function() {
    // Execute action
  });
  // Execute action on remove popover
  $scope.$on('popover.removed', function() {
    // Execute action
  });

})

.controller("WaitingCtrl", function($scope, $state, $ionicPopup, $ionicModal, $location) {

  $scope.cancelJob = function() {
    showConfirm = function() {
    var confirmPopup = $ionicPopup.confirm({
      title: 'cancel job?',
      template: "are you sure you want to cancel?"
      });
      confirmPopup.then(function(res) {
        if (res)
        $state.transitionTo("app.add_job");
      });
    };
    showConfirm();
  }

  $scope.pending=function(){
    $state.transitionTo('app.pendingJob');
  }
})


.controller("PendingCtrl",function($scope, $state, $ionicPopup, $ionicModal, $location, $ionicLoading, $stateParams, $http, Job) {
  $scope.pendingJob=Job;

  $scope.cancelJob = function() {
    showConfirm = function() {
    var confirmPopup = $ionicPopup.confirm({
      title: 'cancel job?',
      template: "are you sure you want to cancel?"
      });
      confirmPopup.then(function(res) {
        if (res)
        $state.transitionTo("app.add_job");
      });
    };
    showConfirm();
  }

  $scope.finished = function() { // this is a placeholder so the demo can continue
    $state.transitionTo("app.summary");
  }
})

.controller("ReviewCtrl", function($scope, $state, $ionicPopup, $ionicModal, $location, $ionicLoading, $stateParams, $http, Job,User) {

  $scope.user=User;
  $scope.job=Job;
  // $scope.submit_feedback = function() {
    $scope.submit_feedback = function() {
       var alertPopup = $ionicPopup.alert({
         title: "Thanks!",
         template: "Thanks for reviewing "+
                    $scope.job.getJobData().worker.first_name+
                    "! You'll be redirected to the main page when you click OK."
       });
       alertPopup.then(function(res) {
        $scope.user.addWorker($scope.job.getJobData().worker);
        $state.transitionTo("app.add_job");
       });
     };

  $scope.questions={
    likert:{
      'the worker was hard-working'                 :4,
      "the worker was as qualified as they claimed" :3,
      'the worker seemed to try to do a good job'   :2
    },
    binary:[
      "i'd hire this person again",
      "this is another binary question",
      "this question is going to go on for a while but the text overflows properly",
      {
        text:"this is a test to really mess with the formula",
        checked:false
      },
    ],
    free_range:{
      "Are there any notes you'd like to make?":"",
      "Describe something please"              :""
    }
  };

for (key in $scope.questions['binary']) {
  if (typeof $scope.questions['binary'][key]==='string') {
    $scope.questions['binary'][key]={
      text: $scope.questions['binary'][key],
      checked: true
    };
  } else if (typeof $scope.questions['binary'][key]!='object') {
    $scope.questions['binary'].splice(key,1); // remove it if it's not valid
  }
}

})

.controller("JobCtrl", function($scope, $state, $ionicPopup, $location, $ionicLoading, $stateParams, $http, Job) {
  $scope.pageName = function() {
    return "none";
  };

  $scope.go = function(jobID) {
    $state.transitionTo("app.showJob",  {jobID: jobID});
  };

  if (parseInt($stateParams.jobID)) {
    var query = parseInt($stateParams.jobID);
    $scope.job = Job.get({
      jobID: query
    });
  } else {
    $scope.jobs = Job.query();
  };

})

.controller("UserCtrl", function($scope, $state, $stateParams,User) {
  $scope.user=User;

})

.controller('JobDetailCtrl', function($scope, $state, $stateParams, Job) {
  var query = parseInt($stateParams.jobID);
  $scope.job = Job.get({
    jobID: query
  });
})


.controller('RegisterCtrl', function($scope, $state, $location, RegistrationService) {
  $scope.user = {
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    languages: '',
    password: '',
    password2: ''
  };

  $scope.$parent.logout_text = 'Logout';

  $scope.register = function() {
    RegistrationService.register($scope.user).then(function() {
      $state.transitionTo("app.first_home");
    })
  }
})

.controller('LoginCtrl', function($scope, $state, $location, RegistrationService) {

  $scope.user = {
    email: '',
    password: ''
  };

  $scope.$parent.logout_text = 'Register';

  $scope.login = function() {
    RegistrationService.login($scope.user.email, $scope.user.password).then(function(res) {
      $state.transitionTo("app.add_job");
    });
  }
  $scope.register = function() {
    $state.transitionTo('register');
  }
})
