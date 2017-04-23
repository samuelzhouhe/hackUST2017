
driverApp.filter('secToTime', [function(){
  return function(seconds) {
  	return new Date(1970, 0, 1).setSeconds(seconds);
  };
}])

driverApp.controller('driverArriveController', function ($scope, $rootScope, $timeout, $firebaseObject, $firebaseArray, $window) {
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

    // map
    var hongkongMap = L.map('hkmap').setView([curOrder.dest[1], curOrder.dest[0]], 15);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2FtdWVsaGUiLCJhIjoiY2lzeXR3N256MGV3MzJvcGd3Z3NnZXJheSJ9.tP7vfvSMJXdSmZbweB6IOw', {
        maxZoom: 18,
        id: 'samuelhe.1c6hdkgb'
        //accessToken: 'pk.eyJ1Ijoic2FtdWVsaGUiLCJhIjoiY2lzeXR3N256MGV3MzJvcGd3Z3NnZXJheSJ9.tP7vfvSMJXdSmZbweB6IOw'
    }).addTo(hongkongMap);

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
    }
  }

  $scope.backNav = function(){
  	$window.location.href = 'driver_track.html';
  }
  $scope.backDriver = function(){
  	$window.location.href = 'driver.html';
  }

});

driverApp.controller('driverTrackController', function ($scope, $rootScope, $timeout, $firebaseObject, $firebaseArray, $window) {
  $rootScope.driver_id = "idd1";
  $rootScope.order_id = "ido1";

  $scope.user_ref=firebase.database().ref("driver/"+$rootScope.driver_id);
  $scope.order_ref=firebase.database().ref("order_delivery/"+$rootScope.order_id);
  $scope.receiver_ref=firebase.database().ref("user")

  // map
  var hongkongMap = L.map('hkmap').setView([22.2838, 114.153], 15);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2FtdWVsaGUiLCJhIjoiY2lzeXR3N256MGV3MzJvcGd3Z3NnZXJheSJ9.tP7vfvSMJXdSmZbweB6IOw', {
        maxZoom: 18,
        id: 'samuelhe.1c6hdkgb'
        //accessToken: 'pk.eyJ1Ijoic2FtdWVsaGUiLCJhIjoiY2lzeXR3N256MGV3MzJvcGd3Z3NnZXJheSJ9.tP7vfvSMJXdSmZbweB6IOw'
  }).addTo(hongkongMap);


  var curUser = $firebaseObject($scope.user_ref);
  var curOrder = $firebaseObject($scope.order_ref);
  $scope.points = [];
  $scope.routeLine;
  curOrder.$loaded().then(function() {
    $scope.status = curOrder.status;
    console.log($scope.status);
    if ($scope.status == "delivering") {
  // polygon end points
  console.log("delivering");
  $scope.points = [[curOrder.source[1], curOrder.source[0]],[22.28680, 114.1537000], [22.2854, 114.1561000],[22.2826, 114.1583000],[curOrder.dest[1], curOrder.dest[0]]];
  $scope.routeLine = L.polyline( $scope.points, {color: 'red', weight: 3, opacity: 0.5, smoothFactor: 1}).addTo(hongkongMap);
    	L.marker([curOrder.dest[1], curOrder.dest[0]]).addTo(hongkongMap).bindPopup("Destination of delivery order: <b>"+curOrder.$id.toString()+"</b>.");
    
    console.log(curOrder.dest[1]);
    console.log(curOrder.dest[0]);
    curOrder.depart_time = new Date().getTime();
    $scope.est_arrive = new Date(curOrder.depart_time + curOrder.est_time * 60 * 1000);
    curOrder.$save();
    }

  
  curUser.$loaded().then(function(){
    curUser.position[0] = 114.14600000;
    curUser.position[1] = 22.28890;
    curUser.$save();
    console.log($scope.status);
    console.log($scope.status == "waiting");
    if ($scope.status == "waiting") {
      console.log("waiting");
      $scope.points = [[curUser.position[1], curUser.position[0]], [curOrder.source[1], curOrder.source[0]]];
      $scope.routeLine = L.polyline( $scope.points, {color: 'blue', weight: 3, opacity: 0.5, smoothFactor: 1}).addTo(hongkongMap);
      L.marker([curOrder.source[1], curOrder.source[0]]).addTo(hongkongMap).bindPopup("Source of delivery order: <b>"+curOrder.$id.toString()+"</b>.");
    }


    var marker = L.marker([curUser.position[1], curUser.position[0]]).addTo(hongkongMap);

    $scope.arrive = function(){
      $timeout.cancel($scope.mytimeout);
      curOrder.status = "delivering";
      $scope.status = "delivering";
  $scope.points = [[curOrder.source[1], curOrder.source[0]],[22.28680, 114.1537000], [22.2854, 114.1561000],[22.2826, 114.1583000],[curOrder.dest[1], curOrder.dest[0]]];
  $scope.routeLine = L.polyline( $scope.points, {color: 'red', weight: 3, opacity: 0.5, smoothFactor: 1}).addTo(hongkongMap);
      L.marker([curOrder.dest[1], curOrder.dest[0]]).addTo(hongkongMap).bindPopup("Destination of delivery order: <b>"+curOrder.$id.toString()+"</b>.");
    
    console.log(curOrder.dest[1]);
    console.log(curOrder.dest[0]);
    curOrder.depart_time = new Date().getTime();
    $scope.est_arrive = new Date(curOrder.depart_time + curOrder.est_time * 60 * 1000);
    curOrder.$save();
    $scope.mytimeout = $timeout($scope.onTimeout,500); 
    }

    // dest 114.163 22.28113
    // source 114.1500 22.28790
    $scope.onTimeout = function(){

    	$scope.points[0][0] = curUser.position[1];
    	$scope.points[0][1] = curUser.position[0];
    	if (curUser.position[1] <= $scope.points[1][0]) {
    	  $scope.points.splice(0, 1);
    	}
    	var x_diff = $scope.points[1][0] - $scope.points[0][0];
    	var y_diff = $scope.points[1][1] - $scope.points[0][1];

    	var percent = 0.0002 / Math.sqrt(x_diff * x_diff + y_diff * y_diff);
    	var x_move = x_diff * percent;
    	var y_move = y_diff * percent;

    	curUser.position[1] = curUser.position[1] + x_move;
    	curUser.position[0] = curUser.position[0] + y_move;
    	/*if (curUser.position[1] > 22.2855 || curUser.position[1] < 22.2828) {
    		curUser.position[1] = curUser.position[1] - 0.00007;
    		curUser.position[0] = curUser.position[0] + 0.00018;
    	}
    	else {
    		curUser.position[1] = curUser.position[1] - 0.00012;
    		curUser.position[0] = curUser.position[0] + 0.0001;
    	}*/
    	curUser.$save();
    	marker.setLatLng([curUser.position[1], curUser.position[0]]).update();
      $scope.routeLine.setLatLngs($scope.points);
    	if (curUser.position[1] > 22.2810) {
    		$scope.mytimeout = $timeout($scope.onTimeout,200);
    	}
      
    }

      $scope.mytimeout = $timeout($scope.onTimeout,1000);    
    
  });
  });
  $scope.stop = function() {
  	if (confirm("Have you arrived at your destination?") == true) {
  	  $timeout.cancel($scope.mytimeout);
  	  curOrder.arrive_time = new Date().getTime();
  	  console.log(curOrder.arrive_time);
  	  curOrder.$save();
  	  $scope.running = false;
  	  $window.location.href = 'driver_arrive.html';
  	}
  }

});