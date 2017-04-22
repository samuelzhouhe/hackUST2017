var driverApp = angular.module('driverApp', ["firebase"]);   //add modules in [] like 'firebase'
driverApp.filter('secToTime', [function(){
  return function(seconds) {
  	return new Date(1970, 0, 1).setSeconds(seconds);
  };
}])

driverApp.controller('driverArriveController', function ($scope, $rootScope, $timeout, $firebaseObject, $firebaseArray) {
  $rootScope.driver_id = "idd1";
  $rootScope.order_id = "ido1";
  $scope.b_signed = false;
  $scope.b_other_trip = false;
  $scope.user_ref=firebase.database().ref("driver/"+$rootScope.driver_id);
  $scope.order_ref=firebase.database().ref("order_delivery/"+$rootScope.order_id);
  $scope.receiver_ref=firebase.database().ref("user");
  $scope.helloMsg = "hello driver!";
  $scope.order = {
    wait_time: 0,
    overtime_price: 0,
  }
  var curUser = $firebaseObject($scope.user_ref);
  var curOrder = $firebaseObject($scope.order_ref);
  curOrder.$loaded().then(function(){
    $scope.order["arrive_time"] = new Date(curOrder.arrive_time);
    $scope.order["depart_time"] = new Date(curOrder.depart_time);
    $scope.order["base_price"] = curOrder.base_price;
    var curReceiver = $firebaseObject($scope.receiver_ref.child(curOrder.receiver));
     curReceiver.$loaded().then(function(){
      $scope.receiver = {
        name: curReceiver.name,
        phone: curReceiver.phone,
      };
    });
  });

  $scope.callReceiver = function() {
    if (confirm("Do you want to call "+$scope.receiver.phone.toString()+"?") == true) {
        window.alert("Calling...");
    } else {
        window.alert("Cancelled.");
    }    
  }

  $scope.onTimeout = function(){
    $scope.order.wait_time++;
    $scope.order.overtime_price = Math.ceil($scope.order.wait_time / 60) * 10;
    mytimeout = $timeout($scope.onTimeout,1000);
  }
  var mytimeout = $timeout($scope.onTimeout,1000);

  $scope.signPackage = function(){
  	var curTime = $scope.order.wait_time;
  	var curPrice = $scope.order.overtime_price;
    if (confirm("Do you want to sign the package?") == true) {
        $timeout.cancel(mytimeout);
        $scope.b_signed = true;
        curOrder.status = "arrived";
        curOrder.total_price = curPrice + $scope.order.base_price;
        curOrder.deliver_time = curOrder.arrive_time + curTime * 1000;
        curOrder.$save();
        $scope.order["deliver_time"] = new Date(curOrder.deliver_time);

        // check whether there are other ongoing trips
        
        for (var key in curUser.package_order) {
         	if (curUser.package_order[key] == $rootScope.order_id) {
          	delete curUser.package_order[key];
          }
        }
        curUser.$save();
        console.log($scope.b_other_trip);
        if ((curUser.package_order == undefined || curUser.package_order.length == 1) && curUser.passenger_order == undefined) {
         	$scope.b_other_trip = false;
        } else {
        	$scope.b_other_trip = true;
        }
        console.log(curUser.package_order);
        console.log(curUser.passenger_order);
        console.log($scope.b_other_trip);
    }
  }

});

driverApp.controller('driverTrackController', function ($scope, $rootScope, $timeout, $firebaseObject, $firebaseArray) {
  $rootScope.driver_id = "idd1";
  $rootScope.order_id = "ido1";

  $scope.user_ref=firebase.database().ref("driver/"+$rootScope.driver_id);
  $scope.order_ref=firebase.database().ref("order_delivery/"+$rootScope.order_id);
  $scope.receiver_ref=firebase.database().ref("user")
  $scope.helloMsg = "hello driver!";
  $scope.order = {
    wait_time: 0,
    overtime_price: 0,
  }
  var curUser = $firebaseObject($scope.user_ref);
  var curOrder = $firebaseObject($scope.order_ref);
  curOrder.$loaded().then(function(){
    $scope.order["arrive_time"] = new Date(curOrder.arrive_time);
    $scope.order["depart_time"] = new Date(curOrder.depart_time);
    $scope.order["base_price"] = curOrder.base_price;
    var curReceiver = $firebaseObject($scope.receiver_ref.child(curOrder.receiver));
     curReceiver.$loaded().then(function(){
      $scope.receiver = {
        name: curReceiver.name,
        phone: curReceiver.phone,
      };
    });
  });

  $scope.callReceiver = function() {
    if (confirm("Do you want to call "+$scope.receiver.phone.toString()+"?") == true) {
        window.alert("Calling...");
    } else {
        window.alert("Cancelled.");
    }    
  }

  $scope.onTimeout = function(){
    $scope.order.wait_time++;
    $scope.order.overtime_price = Math.ceil($scope.order.wait_time / 60) * 10;
    mytimeout = $timeout($scope.onTimeout,1000);
  }
  var mytimeout = $timeout($scope.onTimeout,1000);

  $scope.signPackage = function(){
  	var curTime = $scope.order.wait_time;
  	var curPrice = $scope.order.overtime_price;
    if (confirm("Do you want to sign the package?") == true) {
        $timeout.cancel(mytimeout);
        $scope.b_signed = true;
        curOrder.status = "arrived";
        curOrder.total_price = curPrice + $scope.order.base_price;
        curOrder.deliver_time = curOrder.arrive_time + curTime * 1000;
        curOrder.$save();
        $scope.order["deliver_time"] = new Date(curOrder.deliver_time);

        // check whether there are other ongoing trips
        
        for (var key in curUser.package_order) {
         	if (curUser.package_order[key] == $rootScope.order_id) {
          	delete curUser.package_order[key];
          }
        }
        curUser.$save();
        console.log($scope.b_other_trip);
        if ((curUser.package_order == undefined || curUser.package_order.length == 1) && curUser.passenger_order == undefined) {
         	$scope.b_other_trip = false;
        } else {
        	$scope.b_other_trip = true;
        }
        console.log(curUser.package_order);
        console.log(curUser.passenger_order);
        console.log($scope.b_other_trip);
    }
  }

});