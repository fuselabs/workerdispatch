// angular.module is a global place for creating, registering and retrieving Angular modules
// 'openMarket' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'openMarket.services' is found in services.js
// 'openMarket.controllers' is found in controllers.js
angular.module('openMarket', ['ionic', 'openMarket.controllers', 'openMarket.services', 'ngResource'])

.run(function($window, $location, $ionicPlatform, $rootScope, AuthenticationService) {
  "use strict";

  $rootScope.user = {
    name: $window.sessionStorage.name,
    is_admin: $window.sessionStorage.is_admin
  };

  if ($rootScope.user.is_admin) {
    AuthenticationService.isAdmin = true;
  }

  $rootScope.$on("$stateChangeStart", function(event, toState) {
    //redirect only if both isAuthenticated is false and no token is set

    if (['home', 'login', 'logout', 'register'].indexOf(toState.name) === -1) {
      if (!AuthenticationService.isAuthenticated && !$window.localStorage.token) {
        event.preventDefault();
        $location.path("/");
      }
    }
  });

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('app', {
    url: '/app',
    cache: false,
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.cleaning_quote', {
    url: '^/cleaning_quote',
    cache: false,
    views: {
      'menuContent@app': {
        templateUrl: 'templates/cleaning_quote.html',
        controller: 'QuoteCtrl'
      }
    }
  })

  .state("app.pendingJob",{
    url: '^/pendingJob',
    cache: false,
    views: {
      'menuContent@app': {
        templateUrl: 'templates/pending.html',
        controller: 'PendingCtrl'
      }
    }
  })

  .state('app.showJob', {
    url: '^/worker/jobs/:jobID',
    cache: false,
    views: {
      'menuContent@app': {
        templateUrl: 'templates/job.html',
        controller: 'JobCtrl'
      }
    }
  })

  .state('app.first_home', {
    url: '^/first_home',
    cache: false,
    views: {
      'menuContent@app': {
        templateUrl: 'templates/first_home.html',
        controller: 'RoomCtrl'
      }
    }
  })

  .state('app.room_setup', {
    url: '^/room_setup',
    cache: false,
    views: {
      'menuContent@app': {
        templateUrl: 'templates/room_setup.html',
        controller: 'RoomCtrl'
      }
    }
  })

  .state('app.customerConfirmSched', {
    url: '^/confirm_schedule',
    cache: false,
    views: {
      'menuContent@app': {
        templateUrl: 'templates/confirm_schedule.html',
        controller: 'ScheduleCtrl'
      }
    }
  })

  .state('app.add_job', {
      url: '^/add_job',
      cache: false,
      views: {
        'menuContent@app': {
          templateUrl: 'templates/add_job.html',
          controller: 'AddJobCtrl'
        }
      }
    })
    .state('app.schedule', {
      url: '^/schedule_job',
      cache: false,
      views: {
        'menuContent@app': {
          templateUrl: "templates/schedule.html",
          controller: 'ScheduleCtrl'
        }
      }
    })

  .state("app.waiting", {
    url: '^/waiting',
    cache: false,
    views: {
      'menuContent@app': {
        templateUrl: 'templates/waiting.html',
        controller: "WaitingCtrl"
      }
    }
  })

  .state('app.summary', {
    url: '^/summary',
    cache: false,
    views: {
      'menuContent@app': {
        templateUrl: 'templates/summary.html',
        controller: 'SummaryCtrl'
      }
    }
  })

  .state('app.userProfile', {
    url: '^/profile',
    cache: false,
    views: {
      'menuContent@app': {
        templateUrl: "templates/userProfile.html",
        controller: "UserCtrl"
      }
    }
  })

  .state("app.review_worker", {
    url: '^/review_worker',
    cache: false,
    views: {
      'menuContent@app': {
        templateUrl: 'templates/review_worker.html',
        controller: 'ReviewCtrl'
      }
    }
  })

  .state('register', {
      url: '^/register',
      cache: false,
      templateUrl: "templates/register.html",
      controller: 'RegisterCtrl'
    })
    .state('login', {
      url: '^/login',
      cache: false,
      templateUrl: "templates/login.html",
      controller: 'LoginCtrl'
    })


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

  // Register middleware to ensure our auth token is passed to the server
  $httpProvider.interceptors.push('TokenInterceptor');

})
