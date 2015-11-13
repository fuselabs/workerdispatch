angular.module('openMarket.controllers', [])

.controller('AppCtrl', function($scope, $location, RegistrationService) {
  $scope.logout = function() {
    RegistrationService.logout();
    $location.path("/register");
  }
  $scope.timeleft = '0 secs';
})


.controller("ReviewCtrl",function($scope,$ionicPopup,$location,$ionicLoading,$stateParams,Job){
  $scope.completedJob=Job;

  $scope.payment_policy={
    "cash":"don't leave! we don't handle payment in this case, so they need to pay you directly",
    "credit":"no need to stay; payment will be processed and we'll transfer the money to you.",
    "bitcoin":"this is just an example of open-endedness in paying for things"
  };
  console.log($scope.completedJob.totalTimeInHours());

  $scope.feedback=function(){
    $location.path('/leave_feedback')
  };

  $scope.finalize=function(){
    $location.path("/job_offer");
  };

})

.controller("FeedbackCtrl",function($scope,$ionicPopup,$location,$ionicLoading,$stateParams,Job){
  $scope.finishedJob=Job;

  $scope.questions={
    likert:{
      'the customer was fair'                         :4,
      'the pay for this work was appropriate'         :3,
      'i made every reasonable effort to do good work':2
    },
    binary:[
      "i'd work for this person again",
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

  $scope.announce=function(thing){
    console.log(thing);
  }

  $scope.submitFeedback=function(){
    console.log('send this data to a table');
    $location.path('/job_offer');
  }

})

.controller("PendingCtrl",function($scope,$ionicPopup,$location,$ionicLoading,$stateParams,Job){
  $scope.pendingJob=Job;

  $scope.currentTime=function(){
    return new Date();
  }


$scope.startWork=function(){
  $scope.pendingJob.clockIn();
  $location.path("/working");
};

})

.controller("WorkingCtrl",function($scope,$ionicPopup,$location,$ionicLoading,$stateParams,Job){
  $scope.workDetails=Job;

  $scope.completeJob=function(){
    $scope.workDetails.clockOut();
    $location.path('/review');
  };

  $scope.report=function(){
    console.log('calls someone/does something to let the worker report something is wrong');
  };
})

.controller("JobOfferCtrl",function($scope,$ionicPopup,$location,$ionicLoading,$ionicModal,$stateParams,Job){
  $scope.offer=Job;

  $scope.add=function(a,b){return a+b};
  $scope.totalTime=function(tasks){
    result=new Array;
    for (o in tasks) {
      result.push(tasks[o]);
    }
    return result.reduce($scope.add,0);
  };


  $scope.findTime=function(){
    $ionicModal.fromTemplateUrl('templates/find_time.html',{
      scope:$scope
    }).then(function(modal){
      $scope.modal=modal;
      $scope.modal.show();
    });

    $scope.selectTime=function(timeSelected){
      $scope.offer.confirmTime(timeSelected);
      $scope.finalize();
      $location.path("/pending_job");
    }

    $scope.cancel=function(){
      $scope.finalize();
      $scope.rejectJob();
    };

    $scope.finalize=function(){
      $scope.modal.remove();
    };
  };


  $scope.offer.summary={
    'total time':$scope.totalTime($scope.offer.tasks)/60,
  };
  $scope.offer.summary["total pay"]=$scope.offer.summary['total time']*$scope.offer.pay_rate;

  $scope.acceptJob=function(){
    $location.path('/pending_job');
  };

  $scope.rejectJob=function(){
    console.log("job rejected");
    $location.path("/job_offer");
  };

})

.controller('RegisterCtrl', function($scope, $location, RegistrationService) {
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
      $location.path("/job_offer");
    })
  }
})

.controller('LoginCtrl', function($scope, $location, RegistrationService) {
  $scope.user = {
    email: '',
    password: ''
  };

  $scope.$parent.logout_text = 'Register';

  $scope.login = function() {
    RegistrationService.login($scope.user.email, $scope.user.password).then(function(res) {
      $location.path("/job_offer");
    });
  }

  $scope.register = function() {
    $location.path('/register');
  }

})
