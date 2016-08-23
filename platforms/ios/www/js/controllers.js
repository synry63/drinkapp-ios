angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope,$rootScope, $ionicModal,$location, $timeout,$http,$state,$ionicPopup,$q,Order,User) {

	    var fbLoginSuccess = function(response) {
      $rootScope.loading = true;
      if (!response.authResponse){
        fbLoginError("Cannot find the authResponse");
        return;
      }
      var authResponse = response.authResponse;

      getFacebookProfileInfo(authResponse)
        .then(function(user) {
          User.loginFacebook(user,function(resultCode,result){
            if(resultCode==200 || resultCode==201){
              delete $scope.error_server;
              $scope.success_server = 'Usuario conectado correctamente.';
              $timeout(function() {
                delete $scope.success_server;
                $rootScope.loading = false;
                $scope.closeLogin();
                if($state.current.name=="app.checkout"){
                  $scope.initCheckoutForm();
                }
                else if ($scope.nextLocation!=undefined){
                  $state.go($scope.nextLocation);
                }
              },1000);

            }
          });

        }, function(fail){
          // Fail get profile info

          $rootScope.loading = false;
        });
    };

    // This is the fail callback from the login method
    var fbLoginError = function(error){
      //console.log('fbLoginError', error);
      $rootScope.loading = false;
    };

    // This method is to get the user profile info from the facebook api
    var getFacebookProfileInfo = function (authResponse) {
      var info = $q.defer();

      facebookConnectPlugin.api('/me?fields=email,name,first_name,last_name&access_token=' + authResponse.accessToken, null,
        function (response) {
          //console.log(response);
          info.resolve(response);
        },
        function (response) {
          //console.log(response);
          info.reject(response);
        }
      );
      return info.promise;
    };

    $rootScope.loading = false;

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {

      $scope.nextLocation = toState.name;

      if (toState.requireLogin && typeof User.getCurrentUser() === 'undefined') {
        event.preventDefault();
        $scope.login();
        // get me a login modal!
      }
    });
    $scope.previos_popup = function(){
      // show popup
      var previosPopup = $ionicPopup.show({
        templateUrl: 'templates/previos-popup.html',
        scope: $scope,
        buttons: [
        ]
      });
      $scope.closePopup = function() {
        previosPopup.close();
      };
    }


    // check age
    if(!User.is_condition_accepted()){
      var myPopup = $ionicPopup.show({
        //template: '<input type="password" ng-model="data.wifi">',
        templateUrl: 'templates/checkage-popup.html',
        scope: $scope,
        buttons: [
        ]
      });
      $scope.closePopup = function() {
        User.acceptCondition();
        myPopup.close();
      };
      $scope.exitApp = function(){
        ionic.Platform.exitApp();
      };
    }

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:


    Order.initMasterScope($scope);
    $scope.order_count = Order.getCurrentOrderCount();
	$scope.free_delivery = Order.is_free_delivery();
    $scope.total_order_amount = Order.getOrderAmount();
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    //console.log($scope);
    $scope.modal.show();
  };
    //init checkout form
    $scope.initCheckoutForm = function(){

      var user = User.getCurrentUser();

      if(user!=undefined){ // there is a user registered, no user form writed

        var new_arr_dir = [];
        // destroy links between  new_arr_dir and user.direcciones
		if(user.direcciones!=undefined) { // has never order (NEW MOI)
			for (var i=0;i<user.direcciones.length;i++){
			  var a_dir = user.direcciones[i];
			  new_arr_dir.push(a_dir);
			}
		} 
        var last_item = {
          id:0,
          is_other_name: true,
          nombre:'other',
          custom_name: "Otro",
          value:""
        };
        new_arr_dir.push(last_item);
        //$scope.email_read_only = true;
        $scope.user = user;
        $scope.direcciones = new_arr_dir;
        delete $scope.dir;
      }
      else if(user==undefined && $scope.user){ // so no user registered but a user has write data allready
        $scope.user.id = 0;
        //$scope.email_read_only = false;
        $scope.password_state = { checked: true };
        $scope.dir = {id:0};

      }
      else{
        //$scope.email_read_only = false;
        $scope.password_state = { checked: true };
        $scope.user = {id:0};
        $scope.dir = {id:0};

      }

    }
  // Perform the login action when the user submits the login form
  $scope.doLogin = function(form) {

    if(form.$valid) {
      $rootScope.loading = true;
      User.login($scope.loginData,function(resultCode,result){
        if(resultCode==200){

          delete $scope.error_server;
          $scope.success_server = 'Usuario conectado correctamente.';

          $timeout(function() {
            delete $scope.success_server;
            $rootScope.loading = false;
            $scope.closeLogin();

            if($state.current.name=="app.checkout"){
              // add a last option
              $scope.initCheckoutForm();

            }
            else if ($scope.nextLocation!=undefined){
              //alert('know where to go');
              $state.go($scope.nextLocation);
            }


          }, 1000);

        }
        else{
          $scope.error_server = result;
          $rootScope.loading = false;
        }

      });
    }


  };
    // init facebook login
    $scope.fbLogin = function () {
		
		facebookConnectPlugin.getLoginStatus(function(success){
        if(success.status === 'connected'){
          $rootScope.loading = true;
          // The user is logged in and has authenticated your app, and response.authResponse supplies
          // the user's ID, a valid access token, a signed request, and the time the access token
          // and signed request each expire
          console.log('getLoginStatus', success.status);

          // Check if we have our user saved
          console.log(success);

            getFacebookProfileInfo(success.authResponse)
              .then(function(user) {
                User.loginFacebook(user,function(resultCode,result){
                  if(resultCode==200 || resultCode==201){
                    delete $scope.error_server;
                    $scope.success_server = 'Usuario conectado correctamente.';
                    $timeout(function() {
                      delete $scope.success_server;
                      $rootScope.loading = false;
                      $scope.closeLogin();
                      if($state.current.name=="app.checkout"){
                        $scope.initCheckoutForm();
                      }
                      else if ($scope.nextLocation!=undefined){
                        $state.go($scope.nextLocation);
                      }
                    },1000);

                  }
                });
                
              });

        }
        else {
          
          facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);
        }
      });

    };
})
.controller('AccountCtrl', function($scope,$rootScope,$ionicModal,$ionicPopup,$timeout,$state,$http,$location,$ionicViewService,User,Order) {
    $scope.new_dir = {
    };
    $scope.edit_dir = {
    };
    Order.getDistritosRepartos(function(resultCode,r){
      if(resultCode==200){
        $scope.distritos = r;
      }
    });

	$scope.$on('$ionicView.enter', function(e) {
      var user = User.getCurrentUser();
      User.getLastUserOrder(function(status,r){
        if(status==200){
          $scope.user_last_order = r;
        }
      });
      User.getUserPuntos(function(status,r){
        if(status==200){
          user.puntos = r;
        }
      });
     
      $scope.user = user;

    });
    
    $scope.listCanSwipe = true;
    
    $ionicModal.fromTemplateUrl('templates/user-data-modal.html', {
      scope: $scope,
      id: '1',
      animation: 'slide-in-up',
      backdropClickToClose:false,
    }).then(function(modal) {
      $scope.oModal1 = modal;
    });
    // Modal 2
    $ionicModal.fromTemplateUrl('templates/add-dir-modal.html', {
      scope: $scope,
      id: '2', // We need to use and ID to identify the modal that is firing the event!
      animation: 'slide-in-up',
      backdropClickToClose:false,
    }).then(function(modal) {
      $scope.oModal2 = modal;
    });
    // Modal 3
    $ionicModal.fromTemplateUrl('templates/edit-dir-modal.html', {
      scope: $scope,
      id: '3', // We need to use and ID to identify the modal that is firing the event!
      animation: 'slide-in-up',
      backdropClickToClose:false,
    }).then(function(modal) {
      $scope.oModal3 = modal;
    });
    $scope.closeModalData =function(index){
      delete $scope.error_server;
      delete $scope.success_server;
      if (index == 1) {
        $scope.oModal1.hide();
      }
      else if (index == 2){
        $scope.oModal2.hide();
      }
      else if (index == 3){
        $scope.oModal3.hide();
      }
    };
    $scope.editDataModal = function() {
      $scope.user_to_check = User.getCurrentUser();
      $scope.oModal1.show();
    };
    $scope.addDirModal = function(){
      $scope.oModal2.show();
    },
    $scope.editDirModal = function(a_dir){
      for (i = 0; i < $scope.distritos.length; i++) {
        var test_dir = $scope.distritos[i];
        if(test_dir.name==a_dir.distrito){
          a_dir.distrito = test_dir;
          break;
        }
      }
      //console.log(a_dir);
      $scope.edit_dir = a_dir;
//      console.log($scope.user);
//      console.log(a_dir);
      $scope.oModal3.show();
    }

    $scope.updateName = function (index){
      if(index==1){ // new form dir
        if($scope.new_dir.nombre=="other"){
          $scope.new_dir.is_other_name = true;
        }
        else{
          $scope.new_dir.is_other_name = false;
        }
      }
      else if (index==2){ // edit form dir
        if($scope.edit_dir.nombre=="other"){
          $scope.edit_dir.is_other_name = true;
        }
        else{
          $scope.edit_dir.is_other_name = false;
        }
      }
    }
    $scope.lastPedido = function(id_pedido){
      Order.getLastOrderItems(id_pedido,function(resultCode,result){
        if(resultCode==200){
          var $app_scope = Order.getMasterScope();
          $app_scope.order_count = Order.getCurrentOrderCount();
		  $app_scope.free_delivery = Order.is_free_delivery();
          $app_scope.total_order_amount = Order.getOrderAmount();
          $state.go('app.order');

        }
      });
    },
    // Perform delete dir to user
    $scope.doDeleteDirection = function(dir){
      // A confirm dialog
        var confirmPopup = $ionicPopup.confirm({
          title: '',
          cssClass: 'delete-pop-up-confirm', // String, The custom CSS class name
          okType: 'button-assertive',// String (default: 'button-positive'). The type of the OK button.
          template: '¿Estás seguro?',
          /*buttons: [{ // Array[Object] (optional). Buttons to place in the popup footer.
            text: 'No',
            type: 'button-default',
          }, {
            text: 'Si',
            type: 'button-assertive',
          }],*/
          okText: 'Si', // String (default: 'OK'). The text of the OK button.
          cancelText: 'No', // String (default: 'Cancel'). The text of the Cancel button.
        });
        confirmPopup.then(function(res) {
          if(res) {
            User.deleteDireccion(dir,function(resultCode,r){
              if(resultCode==200){
                var alertPopup = $ionicPopup.alert({
                  template: 'Dirección borrada correctamente',
                  cssClass: 'delete-pop-up-confirm', // String, The custom CSS class name
                  okType: 'button-assertive'// String (default: 'button-positive'). The type of the OK button.
                });
                alertPopup.then(function(res) {

                });
              }
              else{
                var alertPopup = $ionicPopup.alert({
                  template: r,
                  cssClass: 'delete-pop-up-confirm', // String, The custom CSS class name
                  okType: 'button-assertive'// String (default: 'button-positive'). The type of the OK button.
                });
                alertPopup.then(function(res) {

                });
              }
            })
          } else {
          }
        });

    }
    // Perform edit dir
    $scope.doEditDirection = function (form) {
      if(form.$valid) {
        $rootScope.loading = true;
        User.editDireccion($scope.edit_dir,function(resultCode,r){
          if(resultCode==200){
            delete $scope.error_server;
            $scope.success_server = r;
            form.$submitted = false;
            form.$valid = false;

            $timeout(function() {
              delete $scope.success_server;
              $scope.edit_dir = {
              };
              $scope.closeModalData(3);
            }, 1000);
          }
          else{
            $scope.error_server = r;
          }
          $rootScope.loading = false;
        })
      }
    }
    // Perform add dir to user
    $scope.doAddDirection = function(form){
      if(form.$valid) {
        $rootScope.loading = true;
        User.addDireccion($scope.new_dir,function(resultCode,r){
          if(resultCode==200){
            delete $scope.error_server;
            $scope.success_server = r;
            form.$submitted = false;
            form.$valid = false;

            //$scope.dir = $scope.resetFormData();
            $timeout(function() {
              delete $scope.success_server;
              $scope.new_dir = {
              };
              $scope.closeModalData(2);
            }, 1000);
          }
          else{
            $scope.error_server = r;
          }
          $rootScope.loading = false;
        })
      }
    }
    // perform logout
    $scope.doLogout = function (){
      User.logout();
      $scope.user=undefined;
      // using the ionicViewService to hide the back button on next view
      $ionicViewService.nextViewOptions({
        disableBack: true
      });
      $location.path('/');
    }
    // Perform the user update data form
    $scope.doUserDataUpdate = function(form) {
      //console.log(form);
      //console.log($scope.user_to_check);
      //console.log($scope.user);
      if(form.$valid) {
        $rootScope.loading = true;
        User.updateUser($scope.user,function(resultCode,r){
          if(resultCode==200){
            $scope.user =  User.getCurrentUser();
            $scope.success_server = 'Cambios realizados correctamente.';
            $timeout(function() {
              delete $scope.success_server;
              $scope.closeModalData(1);
            }, 1000);
            //$scope.error_server = 'error error !';
            //$scope.modal.hide();
          }
          $rootScope.loading = false;
        });
      }

    };
})
.controller('PlaylistsCtrl', function($scope,$ionicPlatform,$rootScope,$http,$ionicPopup,$ionicSlideBoxDelegate,Playlist,Order,User) {

    var $app_scope =  Order.getMasterScope();
	User.update_popup_promo_corona(false);
    $scope.loading = true;
	
	$ionicPlatform.on('resume', function() {
      $scope.loading = true;
	  User.update_popup_promo_corona(false);
      Playlist.getPlaylists(function(playlists){
        //console.log(playlists);
        $scope.promociones = playlists[0].promocional_img_slider.split(';');
        $scope.playlists = playlists;
        $ionicSlideBoxDelegate.update();
        $scope.loading = false;
      });
    })
	
    $scope.$on('$ionicView.enter', function(e) {
      $app_scope.hide_footer = false;
      $app_scope.total_order_amount = Order.getOrderAmount();
    });
    Playlist.getPlaylists(function(playlists){
      //console.log(playlists);
      $scope.promociones = playlists[0].promocional_img_slider.split(';');
      $scope.playlists = playlists;
      $ionicSlideBoxDelegate.update();
      $scope.loading = false;
    });




})
  .controller('ModalProductCtrl', function($scope,$ionicModal) {

    $ionicModal.fromTemplateUrl('templates/product-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $scope.openModal = function() {
      $scope.modal.show();
    };
    $scope.closeModal = function() {
      $scope.modal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
      // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
      // Execute action
    });

  })

  .controller('PopupCtrl',function($scope,$rootScope, $ionicPopup, $timeout,Order,User) {
    
    // Triggered on a button click, or some other target
    $scope.showPopup = function(p) {
      $scope.data = {}
      $scope.data.quantity = 1;
      $scope.p = p;
      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        //template: '<input type="password" ng-model="data.wifi">',
        templateUrl: 'templates/product-popup.html',
        scope: $scope,
        buttons: [
          {
            text: '<b>Añadir al Carrito</b>',
            type: 'button-assertive',
            onTap: function(e) {
              if (!$scope.data.quantity) {
                //don't allow the user to close unless he enters wifi password
                e.preventDefault();
              } else {
                return $scope.data.quantity;
              }
            }
          },
        ]
      });
      $scope.closePopup = function() {
        myPopup.close();
      };
      $scope.onTapIncrement = function(){
        $scope.data.quantity++;
      }
      $scope.onTapDecrement = function(){
        if($scope.data.quantity>1){
          $scope.data.quantity--;
        }
      }
      myPopup.then(function(res) {
        if(res!=undefined){
		  if(User.is_promo_view()==false){
            $timeout(function(){
                // show popup
                var coronaPopup = $ionicPopup.show({
                  templateUrl: 'templates/corona-popup.html',
                  scope: $scope,
                  buttons: [
                  ]
                });
                $scope.closePopup = function() {
                  coronaPopup.close();
                };

            },500);
            User.update_popup_promo_corona(true);
          }
          Order.addProductToOrder($scope.p,res);
          var $app_scope = Order.getMasterScope();
          $app_scope.order_count = Order.getCurrentOrderCount();
		  $app_scope.free_delivery = Order.is_free_delivery();
          $app_scope.total_order_amount = Order.getOrderAmount();
        }

      });
    };


  })
  .directive("compareTo", function () {
    return {
      require: "ngModel",
      scope: {
        otherModelValue: "=compareTo"
      },
      link: function(scope, element, attributes, ngModel) {

        ngModel.$validators.compareTo = function(modelValue) {
          return modelValue == scope.otherModelValue;
        };

        scope.$watch("otherModelValue", function() {
          ngModel.$validate();
        });
      }
    };
  })
  .controller('CheckoutCtrl',function($scope,$ionicPlatform,$timeout,$ionicScrollDelegate,$rootScope,$ionicViewService,$location,$anchorScroll,$ionicPopup,Order,User) {
    
	$scope.recuerda_popup = function(){
      // show popup
      var recuerdaPopup = $ionicPopup.show({
        templateUrl: 'templates/recuerda-popup.html',
        scope: $scope,
        buttons: [
        ]
      });
      $scope.closePopup = function() {
        recuerdaPopup.close();
      };
    }
    Order.getDistritosRepartos(function(resultCode,r){
      if(resultCode==200){
        $scope.distritos = r;
      }

    });


    $scope.order = Order.getCurrentOrder();
    $scope.total_to_pay = Order.getOrderAmount();
    $scope.comingfrom = {type:'',text:''};
    $scope.reset_obj = {};
    delete  $scope.error_server;

    $scope.updateDir = function(selected){
      if(selected==undefined){
        $scope.dir = angular.copy($scope.reset_obj);
      }
      else{
        for (i = 0; i < $scope.distritos.length; i++) {
          var test_dir = $scope.distritos[i];
          if(test_dir.name==selected.distrito){
            selected.distrito = test_dir;
            break;
          }
        }
        $scope.dir = selected;
      }
    }
    $scope.updateComingFrom = function(selected){
      $scope.comingfrom.type = selected;
    }
    $scope.changePaymentType = function(payment_id){
      $scope.payment_type = payment_id;
      if(payment_id==3){ // init effectivo scope
        $scope.pagoEffectivoCantidad = {
        };
      }
    }
    
    $scope.doPedido = function (form){
      if(form.$valid) {
        $rootScope.loading = true;
        Order.addPedido($scope.user,$scope.dir,$scope.payment_type,$scope.pagoEffectivoCantidad,$scope.comingfrom,function(resultCode,r){
          if(resultCode==200) {
            User.updateUserAfterOrder(r);
            Order.clearOrder();
            var $app_scope = Order.getMasterScope();
            $app_scope.order_count = Order.getCurrentOrderCount();
			$app_scope.free_delivery = Order.is_free_delivery();
            $app_scope.total_order_amount = Order.getOrderAmount();
            delete $scope.success_server;
            delete $scope.error_server;
              var alertPopup = $ionicPopup.alert({
                title: '',
                okType: 'button-assertive', // String (default: 'button-positive'). The type of the OK button.
                templateUrl: 'templates/pedido-confirm-popup.html'
              });
              alertPopup.then(function (res) {
                $ionicViewService.nextViewOptions({
                 disableBack: true
                 });
                 $location.path('/');
                // RATE seccion
                //$ionicPlatform.ready(function() {
                if(User.getCurrentUser().rate_us==undefined){
                  $timeout(function(){
                    var onButtonClicked = function(buttonIndex) {
                      if(buttonIndex==3){ // give note
                        User.setUserRateUs();
                      }
                      //console.log("onButtonClicked -> " + buttonIndex);
                    };
                    AppRate.preferences.callbacks.onButtonClicked = onButtonClicked;
                    AppRate.preferences.useLanguage = 'es';
                    var popupInfo = {};
                    popupInfo.rateButtonLabel = "Califícanos ahora";
                    popupInfo.cancelButtonLabel = "No, gracias";
                    popupInfo.laterButtonLabel = "Más tarde";
                    popupInfo.title = "Califíca DrinkApp";
                    popupInfo.message = "¿Te gusta DrinkApp? Estaríamos encantados si comparte tu experiencia con los demás. ¡Gracias por tu apoyo!";
                    AppRate.preferences.customLocale = popupInfo;					
					AppRate.preferences.openStoreInApp = true;					
                    AppRate.preferences.storeAppURL.ios = '1075963390';
                    // Show the popup immediately
                    AppRate.promptForRating(true);
                  },1200);
                }

              });

          }
          else{
            $ionicScrollDelegate.scrollTop();
			$timeout(function(){
				$scope.error_server = r;
				if(resultCode==403){
					$scope.recuerda_popup();
				}
			 },350)	
          }
          $rootScope.loading = false;
        });
      }
      else{
        $ionicScrollDelegate.scrollTop();
		$timeout(function(){
			$scope.error_server = 'EL FORMULARIO CONTIENE ERRORES. COMPLETA LOS CAMPOS REQUERIDOS CORECTAMENTE Y INTENTALO NUEVAMENTE';
		},350)
      }
    }
  })

  .controller('OrderCtrl',function($scope,$rootScope,$ionicPopup,Order) {
    var $app_scope =  Order.getMasterScope();
    $scope.shouldShowDelete = false;
    $scope.listCanSwipe = true;
    $scope.order_items = Order.getCurrentOrder();
	$scope.free_delivery = Order.is_free_delivery();
    $scope.total_order_amount = Order.getOrderAmount();
    $scope.is_go_checkout_ok = Order.is_min_amount_ok();

    $scope.$on('$ionicView.enter', function(e) {
      $app_scope.hide_footer = true;
    });
    $scope.remove_quantity = function(p){
      Order.updateQuantityOrderProduct(p,1,'less');
      var new_amount = Order.getOrderAmount();
      $scope.is_go_checkout_ok = Order.is_min_amount_ok();
      $scope.total_order_amount =  new_amount;
      $app_scope.total_order_amount =  new_amount;
    }
    $scope.add_quantity = function(p){
      Order.updateQuantityOrderProduct(p,1,'more');
      var new_amount = Order.getOrderAmount();
      $scope.is_go_checkout_ok = Order.is_min_amount_ok();
      $scope.total_order_amount =  new_amount;
      $app_scope.total_order_amount =  new_amount;
    }
    $scope.remove_product = function(index){
      $scope.order_items.splice(index, 1);
	  $scope.free_delivery = Order.is_free_delivery();
      var new_amount = Order.getOrderAmount();
      $scope.is_go_checkout_ok = Order.is_min_amount_ok();
      var new_count = Order.getCurrentOrderCount();

      $scope.total_order_amount = new_amount;

      $app_scope.order_count =  new_count;
      $app_scope.total_order_amount =  new_amount;
    }

    $scope.$on('$ionicView.enter', function(e) {
        $app_scope.hide_footer = true;
    });
  })
.controller('PlaylistCtrl', function($scope,$rootScope, $stateParams,Playlist,Order) {

    Array.prototype.chunk = function(chunkSize) {
      var array=this;
      return [].concat.apply([],
        array.map(function(elem,i) {
          return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
        })
      );
    }
	var $app_scope =  Order.getMasterScope();
    $scope.$on('$ionicView.enter', function(e) {
      $app_scope.hide_footer = false;
      $app_scope.total_order_amount = Order.getOrderAmount();
      var category_with_products = Playlist.getProductsCategorie($stateParams.playlistId);
      var rows = category_with_products.bebidas.chunk(2);
      var out = {};
      out.rows = rows;
      $scope.categoryWithProducts = out;
    });
    var category_with_products = Playlist.getProductsCategorie($stateParams.playlistId);
	
    var rows = category_with_products.bebidas.chunk(2);
    var out = {};
    out.title= category_with_products.nombre;

    out.rows = rows;
    $scope.categoryWithProducts = out;
});
