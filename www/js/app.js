// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers','pasvaz.bindonce','ngMessages'])



.run(function($ionicPlatform) {
 
    $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

  });
})

  .factory('Playlist', function($http) {
    var cachedData;
    function getData(callback) {

      $http.get('http://vrac.ryma-soluciones.com/drinkapp_app_backend/getCategorias').success(function(data) {
        cachedData = data;
        callback(data);
      });
    }
    /*var arr_playlist = [
      { title: 'whisky', id: 1,categoryurlpic:"img/categoria.png" },
      { title: 'pisco', id: 2 ,categoryurlpic:"img/pisco.png"},
      { title: 'vodka', id: 3 ,categoryurlpic:"img/vodka.png"},
      { title: 'gin', id: 4 ,categoryurlpic:"img/gin.png"},
      { title: 'rum', id: 5 ,categoryurlpic:"img/pancakes2.png"},
      { title: 'energizantes', id: 6 ,categoryurlpic:"img/energizante.png"},
      { title: 'otros', id: 7 ,categoryurlpic:"img/otros.png"}
    ];*/

    return {
      /*getCurrentPlaylist: function($id){

        for (var i = 0; i < arr_playlist.length; i++) {
          if(arr_playlist[i].id==$id){
            return arr_playlist[i];
          }

        }
      },*/
      getPlaylists:getData,/*function(callback){
        $http.get('http://vrac.ryma-soluciones.com/drinkapp_app_backend/getCategorias').success(function(data) {
          console.log(data);
          cachedData = data.results;
          callback(data.results);
        });
        return arr_playlist;
      }*/
      getProductsCategorie: function($id){
        for (var i = 0; i < cachedData.length; i++) {
          if(cachedData[i].id==$id){
            return cachedData[i];
          }

        }
      }
    }
  })
  .factory('User', function($http) {
    var cachedUser = undefined;
    var is_over_18 = undefined;
	var promo_view = false;
    function callUserData(loginData,callback) {
      $http({
        method: 'POST',
        url: 'http://vrac.ryma-soluciones.com/drinkapp_app_backend/login',
        data:loginData,
        withCredentials: false,
        headers: {
          'Content-Type': 'application/json'
          //'X-Custom-Header': 'value'
        }
        //data: 'key1='+$scope.loginData.username+'&key2=value2',
        //headers: { 'Content-Type': 'application/json','Access-Control-Allow-Headers':'*'},

      }).then(function(resp) {
        // For JSON responses, resp.data contains the result
        cachedUser = resp.data;
        window.localStorage['user'] = angular.toJson(cachedUser);
        callback(resp.status,resp.data);

      }, function(err) {
        // err.status will contain the status code
        callback(err.status,err.data.msg);
        //$scope.error = err.data.msg;

      })
    }
    return {
      is_previos_saw: function (){
        var saw = true;
        if(window.localStorage['previos']==undefined){ // never seen before
            saw = false;
        }
        else{
            var previos = window.localStorage['previos'];
            // so check time
            var timestamp_now = Math.floor(Date.now() / 1000);
            var timestamp_saved =parseInt(previos);
            //console.log(timestamp_saved);
            //console.log(timestamp_now);
            if(timestamp_saved<timestamp_now){
              //alert('here');
              saw = false;
            }
        }

        return saw;
      },
      is_promo_view:function(){
        return promo_view;
      },
      update_popup_promo_corona:function(new_state){
        promo_view = new_state;
        window.localStorage['promo_view'] = angular.toJson(promo_view);
      },
      /*reset_popup_promo_corona : function(){
        var is_promo_view = false;
        window.localStorage['promo_view'] = angular.toJson(is_promo_view);
      },*/
      update_time_previos_time : function(){
        var previos = Math.floor(Date.now() / 1000);
        previos+=86400; // more 24 hours
        window.localStorage['previos'] = angular.toJson(previos);
      },
      acceptCondition:function(){
        is_over_18 = true;
        window.localStorage['condition'] = angular.toJson(is_over_18);
      },
      is_condition_accepted:function(){
        var trouve = false;
        if(is_over_18!=undefined){
          trouve = true;
        }
        else if(window.localStorage['condition']!=undefined){
          trouve = true;
        }

        return trouve;
      },
      getCurrentUser:function(){
        if (typeof cachedUser === 'undefined'){
          cachedUser = window.localStorage['user'];
          if (typeof cachedUser === 'string') {
            cachedUser = angular.fromJson(cachedUser);
          }
        }
        return cachedUser;
      },
      login:callUserData,
      loginFacebook:function(userFacebook,callback){
        $http({
          method: 'POST',
          url: 'http://vrac.ryma-soluciones.com/drinkapp_app_backend/loginFacebook',
          data:userFacebook,
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json'
            //'X-Custom-Header': 'value'
          }
          //data: 'key1='+$scope.loginData.username+'&key2=value2',
          //headers: { 'Content-Type': 'application/json','Access-Control-Allow-Headers':'*'},

        }).then(function(resp) {
          // For JSON responses, resp.data contains the result
          cachedUser = resp.data;
          window.localStorage['user'] = angular.toJson(cachedUser);
          callback(resp.status,resp.data);

        }, function(err) {
          // err.status will contain the status code
          callback(err.status,err.data.msg);
          //$scope.error = err.data.msg;

        })
      },
      setUserRateUs:function(){
        this.getCurrentUser();
        $http({
          method: 'POST',
          url: 'http://vrac.ryma-soluciones.com/drinkapp_app_backend/rate_us',
          data:{'id':cachedUser.id},
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json'
            //'X-Custom-Header': 'value'
          }
          //data: 'key1='+$scope.loginData.username+'&key2=value2',
          //headers: { 'Content-Type': 'application/json','Access-Control-Allow-Headers':'*'},

        }).then(function(resp) {
          // For JSON responses, resp.data contains the result
          cachedUser = resp.data;
          window.localStorage['user'] = angular.toJson(cachedUser);
          //callback(resp.status,resp.data);

        }, function(err) {
          // err.status will contain the status code
          //callback(err.status,err.data.msg);
          //$scope.error = err.data.msg;

        })
      },
      getUserPuntos:function(callback){
        $http({
          method: 'POST',
          url: 'http://vrac.ryma-soluciones.com/drinkapp_app_backend/getUserPuntos',
          data:{'id':cachedUser.id},
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json'
            //'X-Custom-Header': 'value'
          }
          //data: 'key1='+$scope.loginData.username+'&key2=value2',
          //headers: { 'Content-Type': 'application/json','Access-Control-Allow-Headers':'*'},

        }).then(function(resp) {
          // For JSON responses, resp.data contains the result
          callback(resp.status,resp.data);

        }, function(err) {
          // err.status will contain the status code
          callback(err.status,err.data.msg);
          //$scope.error = err.data.msg;

        })
      },	  
      getLastUserOrder:function(callback){
        $http({
          method: 'POST',
          url: 'http://vrac.ryma-soluciones.com/drinkapp_app_backend/getUserLastOrder',
          data:{'id':cachedUser.id},
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json'
            //'X-Custom-Header': 'value'
          }
          //data: 'key1='+$scope.loginData.username+'&key2=value2',
          //headers: { 'Content-Type': 'application/json','Access-Control-Allow-Headers':'*'},

        }).then(function(resp) {
          // For JSON responses, resp.data contains the result
          callback(resp.status,resp.data);

        }, function(err) {
          // err.status will contain the status code
          callback(err.status,err.data.msg);
          //$scope.error = err.data.msg;

        })
      },
      logout:function(){
        cachedUser = undefined;
        delete window.localStorage['user'];
      },
      updateUserAfterOrder:function(user){
        cachedUser = user;
        window.localStorage['user'] = angular.toJson(cachedUser);

      },
      updateUser:function(user,callback){
        $http({
          method: 'POST',
          url: 'http://vrac.ryma-soluciones.com/drinkapp_app_backend/updateUser',
          data:user,
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json'
            //'X-Custom-Header': 'value'
          }

        }).then(function(resp) {
          // For JSON responses, resp.data contains the result
          cachedUser = resp.data;
          window.localStorage['user'] = angular.toJson(cachedUser);
          callback(resp.status,resp.data);

        }, function(err) {
          // err.status will contain the status code
          callback(err.status,err.data.msg);

        })
      },
      deleteDireccion:function(dir,callback){
        $http({
          method: 'POST',
          url: 'http://vrac.ryma-soluciones.com/drinkapp_app_backend/deleteDireccion',
          data:dir,
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json'
            //'X-Custom-Header': 'value'
          }

        }).then(function(resp) {
          // For JSON responses, resp.data contains the result
          for (var i = 0; i<cachedUser.direcciones.length;i++){
            //alert(cachedUser.direcciones[i].id);
            if(resp.data==cachedUser.direcciones[i].id){
              cachedUser.direcciones.splice(i, 1);
              break;
            }
          }
          window.localStorage['user'] = angular.toJson(cachedUser);
          callback(resp.status,resp.data);

        }, function(err) {
          // err.status will contain the status code
          callback(err.status,err.data.msg);

        })
      },
      editDireccion:function(dir,callback){
        dir.id_user = cachedUser.id;
        $http({
          method: 'POST',
          url: 'http://vrac.ryma-soluciones.com/drinkapp_app_backend/editDireccion_v2',
          data:dir,
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json'
            //'X-Custom-Header': 'value'
          }

        }).then(function(resp) {
          // For JSON responses, resp.data contains the result
          cachedUser.direcciones = resp.data;
          window.localStorage['user'] = angular.toJson(cachedUser);
          callback(resp.status,'Dirección editada correctamente.');

        }, function(err) {
          // err.status will contain the status code
          callback(err.status,err.data.msg);

        })
      },
      addDireccion:function(dir,callback){
        dir.id_user = cachedUser.id;
        $http({
          method: 'POST',
          url: 'http://vrac.ryma-soluciones.com/drinkapp_app_backend/addDireccion_v2',
          data:dir,
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json'
            //'X-Custom-Header': 'value'
          }

        }).then(function(resp) {
          // For JSON responses, resp.data contains the result
          cachedUser.direcciones = resp.data;
          window.localStorage['user'] = angular.toJson(cachedUser);
          callback(resp.status,'Dirección añadida correctamente.');

        }, function(err) {
          // err.status will contain the status code
          callback(err.status,err.data.msg);

        })
      }
    }
  })
  .factory('Order', function($http) {
    var order = {};
    order.pList = [];
    var master_scope;
    var min_amount_ko = true;
    var min_amount = 50;
	var free_delivery = false;
    return {
      initMasterScope:function(scope){
        master_scope = scope;
      },
      getMasterScope:function(){
        return master_scope;
      },
      clearOrder:function(){
        order.pList = [];
      },
      is_min_amount_ok:function(){
        return min_amount_ko;
      },
      getLastOrderItems:function(id_order,callback){
        $http({
          method: 'POST',
          url: 'http://vrac.ryma-soluciones.com/drinkapp_app_backend/getOrderItems',
          data:{'id':id_order},
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json'
            //'X-Custom-Header': 'value'
          }
          //data: 'key1='+$scope.loginData.username+'&key2=value2',
          //headers: { 'Content-Type': 'application/json','Access-Control-Allow-Headers':'*'},

        }).then(function(resp) {
          // For JSON responses, resp.data contains the result
          order.pList = [];
          for (var i =0;i<resp.data.length;i++){
            var obj = {};
            obj.p = resp.data[i].bebida;
            obj.q = resp.data[i].cantidad;
            order.pList.push(obj);


          }
          callback(resp.status);

        }, function(err) {
          // err.status will contain the status code
          callback(err.status,err.data.msg);
          //$scope.error = err.data.msg;

        })
      },
      updateQuantityOrderProduct:function(p,q,state){
        for (var i =0;i<order.pList.length;i++){
          var obj_order = order.pList[i];
          if(obj_order.p.id==p.id){
            if(state=="more"){
              order.pList[i].q+=q;
            }
            else{
              if(obj_order.q>1){
                order.pList[i].q-=q;
              }
            }
          break;
          }
        }
      },
      addProductToOrder: function(p,q){
          // check if same product selected
          var trouve = false;
          for (var i =0;i<order.pList.length;i++){
            var obj_order = order.pList[i];
            if(obj_order.p.id==p.id){
              trouve = true;
              break;
            }
          }
          if(trouve){
            order.pList[i].q+= q;
          }
          else{
            var obj = {};
            obj.p = p;
            obj.q = q;
            order.pList.push(obj);
          }
      },
      getCurrentOrderCount:function(){
        return order.pList.length;
      },
      is_free_delivery:function(){
        for (var i=0;i<order.pList.length;i++){
          if(order.pList[i].p.free_delivery==true){
            free_delivery = true;
            return true;

          }
        }
        free_delivery = false;
        return false;

      },
      getOrderAmount:function(){
        var amount = 0;
        for (var i=0;i<order.pList.length;i++){
          var price_init = order.pList[i].p.price;
          var quantity = order.pList[i].q;
          amount+= price_init*quantity;
        }
        var total = Math.round(amount * 100) / 100;
        if(total>=min_amount){
          min_amount_ko = false;
        }
        else{
          min_amount_ko = true;
        }
        if(total>0 && free_delivery==false){
          total+=3.50 // more delivery
        }
        return total.toFixed(2);
      },
      getCurrentOrder:function(){
        return order.pList;
      },
      addPedido:function(user,dir,payment_type,amount_obj,coming_from,callback){
        var data = {
          'dir':dir,
          'user':user,
          'payment_id':payment_type,
          'amount_obj':amount_obj,
          'coming_from':coming_from,
          'order':order
        }
        $http({
          method: 'POST',
          url: 'http://vrac.ryma-soluciones.com/drinkapp_app_backend/addPedido_v4',
          data:data,
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json'
            //'X-Custom-Header': 'value'
          }

        }).then(function(resp) {
          // For JSON responses, resp.data contains the result

          callback(resp.status,resp.data);

        }, function(err) {
          // err.status will contain the status code
          callback(err.status,err.data.msg);

        })
      }
    }
  })
  .config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider,$httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    $ionicConfigProvider.backButton.previousTitleText(false).text('');
    $ionicConfigProvider.views.transition('platform');
    $ionicConfigProvider.views.forwardCache(true);
    if(ionic.Platform.isAndroid()){
      $ionicConfigProvider.scrolling.jsScrolling(false); // native scroll
    }
    $stateProvider
    //$ionicConfigProvider.navBar.alignTitle('center')
      .state('app', {
      url: '/app',
        cache: true,
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
    })

    .state('app.account', {
      url: '/account',
      cache: true,
      //data: {
        requireLogin: true, // this property will apply to all children of 'app'
      //},
      views: {
        'menuContent': {
          templateUrl: 'templates/account.html',
          controller: 'AccountCtrl'
        }
      }

    })

    .state('app.browse', {
        url: '/browse',
        cache: true,
        views: {
          'menuContent': {
            templateUrl: 'templates/browse.html'
          }
        }
      })
      .state('app.playlists', {
        url: '/playlists',
        cache: true,
        //templateUrl: 'templates/playlists.html',
        //controller: 'PlaylistsCtrl',
        views: {
          'menuContent': {
            templateUrl: 'templates/playlists.html',
            controller: 'PlaylistsCtrl'
          }
        }
      })
      .state('app.order', {
        url: '/order',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/order.html',
            controller: 'OrderCtrl'
          }
        }
      })
      .state('app.checkout', {
        url: '/checkout',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/checkout.html',
            controller: 'CheckoutCtrl'
          }
        }
      })
    .state('app.single', {
      url: '/playlists/:playlistId',
        cache: true,
      views: {
        'menuContent': {
          templateUrl: 'templates/playlist.html',
          controller: 'PlaylistCtrl'
        }
      }
    });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/playlists');


});
