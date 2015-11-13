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

    // if (['home', 'login', 'logout', 'register'].indexOf(toState.name) === -1) {
    //   if (!AuthenticationService.isAuthenticated && !$window.localStorage.token) {
    //     event.preventDefault();
    //     $location.path("/home");
    //   }
    // }

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
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
})

.state("app.considerJob",{
  url:"^/job_offer",
  views: {
    'menuContent': {
      templateUrl:"templates/job_offer.html",
      controller:"JobOfferCtrl"
      }
    }
})

.state('app.pendingJob',{
  url:"^/pending_job",
  views: {
    'menuContent': {
      templateUrl:'templates/pending_job.html',
      controller:"PendingCtrl"
      }
    }
})

.state('app.currentlyWorking',{
  url:"^/working",
  views: {
    'menuContent': {
      templateUrl:"templates/working.html",
      controller:"WorkingCtrl"
      }
    }
})

.state('app.summarizeWork',{
  url:"^/review",
  views: {
    'menuContent': {
      templateUrl:"templates/review.html",
      controller:"ReviewCtrl"
      }
    }
})

.state('app.feedback',{
  url:'^/leave_feedback',
  views: {
    'menuContent': {
      templateUrl:"templates/leave_feedback.html",
      controller: 'FeedbackCtrl'
      }
    }
})

.state('register', {
  url:'^/register',
  templateUrl:"templates/register.html",
  controller: 'RegisterCtrl'
})
.state('login', {
  url:'^/login',
  templateUrl:"templates/login.html",
  controller: 'LoginCtrl'
})

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

  // Register middleware to ensure our auth token is passed to the server
  $httpProvider.interceptors.push('TokenInterceptor');

})
