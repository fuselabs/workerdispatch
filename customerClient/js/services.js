angular.module('openMarket.services', ['ngResource'])

.factory('SocketIO', function() {
  return io()
})

.factory("Worker",function($resource){
  return $resource("/api/workers/:id");
})

.factory('Job', function($resource) {
  var data={
      rates: {
        hourlyRate:25,
        surcharges: {
          "Administrative fees": .05,
          "Sick feave": .10
        }
      },
    client:{
        given_name:"",
        surname:"",
        customer_id:1,
        profile_photo:null
      },
    worker:{
      worker_id:1,
      first_name:"first name",
      last_name:"last name",
      bio: "enter a bio here",
      profile:null,
      last_date:null
      },
    time_needed: new Date(2015,8,4,15,0,0,0),
    time_started:null,
    time_finished:null,
    location: {
      address:"dummy address here",
      rooms: {
              "bathroom"    :{"count":1,"time to clean":40},
              "bedroom"     :{"count":2,"time to clean":30},
              "kitchen"     :{"count":1,"time to clean":45},
              "living room" :{"count":1,"time to clean":20}
      }
    },
    tasks:{ // dummy tasks
      'bathroom'   :['clean toilet','clean sink','replace toilet paper'],
      'living room':['find remote controls','vacuum','rotate cushions']
    },
    placeMap:'img/preview.png',
    preferredTimes: [
              new Date(2015,8,4,12,30,0,0),
              new Date(2015,8,4,15,0,0,0),
              new Date(2015,8,4,9,30,0,0),
              new Date(2015,8,4,11,0,0,0),
    ].sort(function(a, b) {
        return new Date(a) - new Date(b);
      }),
    payment_form: 'cash',
  };

    function getPreferredTimes(){
      return data.preferredTimes;
    }

    function setPreferredTimes(pTimes){
      preferredTimes=pTimes;
    }


    function totalTimeInHours() {
      total = 0;
      for (room in data.location.rooms) {
        total+=data.location.rooms[room]['time to clean']*data.location.rooms[room].count;
      }
      return window.Math.round(total/60);
    }

    function setHomeData(homeData){
      data.location=homeData;
    }

    function totalCost(){
      var total=data.rates.hourlyRate*totalTimeInHours();
      var surcharges=0;
      for (extra in data.rates.surcharges){
        surcharges+=data.rates.surcharges[extra]*total;
      }
      return surcharges+total;
    }

  function getJobData(){
    return data;
  }
  function jobBreakdown(){
    return data.rates;
  }

  return {
    jobBreakdown:jobBreakdown,
    setPreferredTimes:setPreferredTimes,
    getPreferredTimes:getPreferredTimes,
    getJobData:getJobData,
    setHomeData:setHomeData,
    totalTimeInHours:totalTimeInHours,
    totalCost:totalCost
  }
})

.factory("User",function($resource){

  var data={

    user_id:1,
    first_name:"ali",
    last_name:'alkhatib',
    time_registered: new Date(2015, 8, 12, 19, 23, 32),
    past_workers: [],
    homes: [],
  };

  function getAddressMap(){
    return "img/preview.png";
  }

  function getUserData(){
    return data;
  }

  function past_workers(){
    return data.past_workers;
  }

  function totalTimeInHours(home) {
    total = 0;
    for (room in home.rooms) {
      total+=home.rooms[room]['time to clean']*home.rooms[room].count;
    }
    return window.Math.round(total/60);
  }

  function addHome(home) {
    data.homes.push(JSON.parse(JSON.stringify(home)));
  }
  function addWorker(workerName){
    workerName.last_date=new Date();
    data.past_workers.push(workerName);
  }

  return {
    addHome:addHome,
    getAddressMap:getAddressMap,
    past_workers:past_workers,
    totalTimeInHours:totalTimeInHours,
    getUserData:getUserData,
    addWorker:addWorker
  }
})


.factory('AuthenticationService', function() {
  var auth = {
    isAuthenticated: false,
    isAdmin: false
  }

  return auth;
})

.factory('TokenInterceptor', function($q, $window, $location, AuthenticationService) {
  return {
    request: function(config) {
      config.headers = config.headers || {};
      if ($window.localStorage.token) {
        config.headers.Authorization = 'Bearer ' + $window.localStorage.token;
      }
      return config;
    },

    requestError: function(rejection) {
      return $q.reject(rejection);
    },

    /* Set Authentication.isAuthenticated to true if 200 received */
    response: function(response) {
      if (response != null && response.status == 200 && $window.localStorage.token && !AuthenticationService.isAuthenticated) {
        AuthenticationService.isAuthenticated = true;
      }
      return response || $q.when(response);
    },

    /* Revoke client authentication if 401 is received */
    responseError: function(rejection) {
      if (rejection != null && rejection.status === 401 && ($window.localStorage.token || AuthenticationService.isAuthenticated)) {
        delete $window.localStorage.token;
        AuthenticationService.isAuthenticated = false;
        $location.path("/register");
      }

      return $q.reject(rejection);
    }
  };
})


.factory("myHomes",function(){
  var homes=[
  ];

  function set(data){
    homes=data;
  }
  function get(){
    return homes;
  }
  return {
    set:set,
    get:get
  }

})


.factory('RegistrationService', function($window, $http, $ionicPopup, $rootScope, AuthenticationService) {
  return {
    login: function(email, password) {
      return $http.post('login', {
        email: email,
        password: password
      }).then(function(result) {
        console.log(result);
        $rootScope.user = result.data;
        AuthenticationService.isAuthenticated = true;
        AuthenticationService.isAdmin = result.data.is_admin;

        $window.sessionStorage.name     = result.data.name;
        $window.sessionStorage.is_admin = result.data.is_admin;
        $window.localStorage.token      = result.data.token;
      }).catch(function(err) {
        $ionicPopup.alert({
          title: 'Failed',
          content: err.data
        });
      });;
    },

    logout: function() {
      delete $window.localStorage.token;
    },

    register: function(user) {
      return $http.post('register', user).then(function(result) {
        $rootScope.user = result.data;
        AuthenticationService.isAuthenticated = true;
        $window.sessionStorage.name     = result.data.name;
        $window.sessionStorage.is_admin = result.data.is_admin;
        $window.localStorage.token      = result.data.token;
        console.log(result.data);
      }).catch(function(err) {
        $ionicPopup.alert({
          title: 'Failed',
          content: err.data
        });
      });
    }
  }
})

.factory('UserResponse', function() {
  var storageKey = 'userResponses';

  var localGet = function() {
    var ret = localStorage.getItem(storageKey);
    if (ret === null) {
      ret = {};
    } else {
      ret = JSON.parse(ret);
    }
    return ret;
  };

  var localSet = function(val) {
    localStorage.setItem(storageKey, JSON.stringify(val));
  };

  return {
    set: function(key, value) {
      var answers = localGet();
      answers[key] = value;
      localSet(answers);
    },

    get: function(key) {
      var answers = localGet();
      return answers[key];
    },

    reset: function() {
      localStorage.removeItem(storageKey);
    }
  };
})
