var driverApp = angular.module('driverApp', ["firebase"]);   //add modules in [] like 'firebase'
driverApp.filter('secToTime', [function(){
  return function(seconds) {
  	return new Date(1970, 0, 1).setSeconds(seconds);
  };
}])

driverApp.controller('driverArriveController', function ($scope, $rootScope, $timeout, $firebaseObject, $firebaseArray) {
  $rootScope.driver_id = "idd1";
  $rootScope.order_id = "ido1";
  $rootScope.b_signed = false;
  $rootScope.order_ref=firebase.database().ref("order_delivery/"+$rootScope.order_id);
  $rootScope.receiver_ref=firebase.database().ref("user")
  $scope.helloMsg = "hello driver!";
  $scope.order = {
    wait_time: 0,
    overtime_price: 0,
  }
  var curOrder = $firebaseObject($rootScope.order_ref);
  curOrder.$loaded().then(function(){
    $scope.order["arrive_time"] = new Date(curOrder.arrive_time);
    $scope.order["depart_time"] = new Date(curOrder.depart_time);
    $scope.order["base_price"] = curOrder.base_price;
    var curReceiver = $firebaseObject($rootScope.receiver_ref.child(curOrder.receiver));
     curReceiver.$loaded().then(function(){
      $scope.receiver = {
        name: curReceiver.name,
        phone: curReceiver.phone,
      };
      console.log($scope.receiver.name);
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
        $rootScope.b_signed = false;
        curOrder.status = "arrived";
        curOrder.total_price = curPrice + $scope.order.base_price;
        curOrder.$save();
    }
  }

});