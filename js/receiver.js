/**
 * Created by samuelhe on 22/4/2017.
 */

var receiverApp = angular.module('receiverApp', ['firebase']);   //add modules in [] like 'firebase'
receiverApp.controller('receiverAppController', function ($scope, $rootScope, $timeout, $firebaseObject, $firebaseArray, $window) {

    $scope.changeCurrUser = function () {
        if ($scope.newid != ''){
            $scope.currentUserID= $scope.newid;
            $scope.newid = '';
            $scope.loadThisReceiver($scope.currentUserID);
        }
    };

    $scope.loadThisReceiver = function(hisid){
        //map initialization
        $scope.hongkongMap = L.map('hkmap-receiver').setView([22.2964, 114.1595], 11);
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2FtdWVsaGUiLCJhIjoiY2lzeXR3N256MGV3MzJvcGd3Z3NnZXJheSJ9.tP7vfvSMJXdSmZbweB6IOw', {
            maxZoom: 18,
            id: 'samuelhe.1c6hdkgb'
            //accessToken: 'pk.eyJ1Ijoic2FtdWVsaGUiLCJhIjoiY2lzeXR3N256MGV3MzJvcGd3Z3NnZXJheSJ9.tP7vfvSMJXdSmZbweB6IOw'
        }).addTo($scope.hongkongMap);
        var invitationRef = firebase.database().ref().child("user/" + hisid + "/invitations");
        $scope.myInvitations = $firebaseArray(invitationRef);

        $scope.allOrdersDisplay = [];
        $scope.allMarkers = [];

        $scope.allOrders = $firebaseArray(firebase.database().ref().child("order_delivery/"));
    };

    $scope.$watch("myInvitations", function (newValue, oldValue) {
        $scope.fetchDisplayDetails();
    }, true);


    //update the "allOrders", which is being displayed
    $scope.includedOrders = [];
    //allMarkers, allOrdersDisplay, includedOrders should be stricly in order.

    $scope.fetchDisplayDetails = function(){
        for(var i =0; i<$scope.myInvitations.length; i++){
            var orderid = $scope.myInvitations[i].$value;
            console.log(orderid);
            //traverse all orders and retrieve this one
            for (var j=0; j<$scope.allOrders.length; j++){
                if ($scope.allOrders[j].$id == orderid){
                    //a matching found!
                    if ( $scope.includedOrders.indexOf(orderid) ==-1 ){
                        $scope.includedOrders.push(orderid);
                        var newOrderToDisplay = $scope.allOrders[j];
                        newOrderToDisplay.id = orderid;
                        $scope.allOrdersDisplay.push(newOrderToDisplay);
                        var dropoffMarker = L.marker([newOrderToDisplay.dest[1],newOrderToDisplay.dest[0]]);
                        dropoffMarker.bindPopup("Pickup Here");
                        $scope.allMarkers.push(dropoffMarker);
                        $scope.hongkongMap.addLayer(dropoffMarker);
                    }
                }
            }
        }
    };

    //callback function of pushing "view location" button on screen
    $scope.viewPickupLocation = function (index) {
        if ($scope.allMarkers[index].getPopup()._isopen){
            $scope.allMarkers[index].closePopup();
        }else{
            $scope.allMarkers[index].openPopup();
        }
    };



    $scope.rejectPickup = function (index){
        var rejectid = $scope.includedOrders[index];
        //change the status of this order
        for (var i =0; i<$scope.allOrders.length; i++){
            if($scope.allOrders[i].$id == rejectid){
                $scope.statusToChange = $firebaseObject(firebase.database().ref().child("order_delivery/" + rejectid + "/status"));
                $scope.statusToChange.$loaded().then(function(){
                    $scope.statusToChange.$value = "rejectedByReceiver";
                    $scope.statusToChange.$save();
                });
            }
        }
        //remove this order from invitation
        $scope.myInvitations.$remove(index);
        //update local copies, in order to update display
        for(var j=0; j<$scope.includedOrders.length; j++){
            if ($scope.allOrdersDisplay[j].id == rejectid){
                $scope.allOrdersDisplay.splice(j,1);
                $scope.includedOrders.splice(j,1);
            }
        }
        //update marker on map
        $scope.hongkongMap.removeLayer($scope.allMarkers[index]);
    };


    $scope.confirmPickup = function(index){
        var confirmid = $scope.includedOrders[index];   //id of confirmed delivery order
        //change the status of this order
        for (var i =0; i<$scope.allOrders.length; i++){
            if($scope.allOrders[i].$id == confirmid){
                $scope.statusToChange = $firebaseObject(firebase.database().ref().child("order_delivery/" + confirmid + "/status"));
                $scope.statusToChange.$loaded().then(function(){
                    $scope.statusToChange.$value = "confirmedByReceiver";
                    $scope.statusToChange.$save();
                });
            }
        }
        //remove this order from invitation
        $scope.myInvitations.$remove(index);
        //update local copies, in order to update display
        for(var j=0; j<$scope.includedOrders.length; j++){
            if ($scope.allOrdersDisplay[j].id == confirmid){
                $scope.allOrdersDisplay.splice(j,1);
                $scope.includedOrders.splice(j,1);
            }
        }
        //update marker on map
        $scope.hongkongMap.removeLayer($scope.allMarkers[index]);

        $scope.showDriver();

    };


    $scope.showDriver = function () {
        $scope.showDriverTracking = true;
        $rootScope.driver_id = "idd1";
        $rootScope.order_id = "ido1";

        $scope.user_ref=firebase.database().ref("driver/"+$rootScope.driver_id);
        $scope.order_ref=firebase.database().ref("order_delivery/"+$rootScope.order_id);
        $scope.receiver_ref=firebase.database().ref("user")
        var hongkongMap = L.map('hkmap').setView([22.2838, 114.153], 15);
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2FtdWVsaGUiLCJhIjoiY2lzeXR3N256MGV3MzJvcGd3Z3NnZXJheSJ9.tP7vfvSMJXdSmZbweB6IOw', {
            maxZoom: 18,
            id: 'samuelhe.1c6hdkgb'
            //accessToken: 'pk.eyJ1Ijoic2FtdWVsaGUiLCJhIjoiY2lzeXR3N256MGV3MzJvcGd3Z3NnZXJheSJ9.tP7vfvSMJXdSmZbweB6IOw'
        }).addTo(hongkongMap);

        var curUser = $firebaseObject($scope.user_ref);
        var curOrder = $firebaseObject($scope.order_ref);
        curOrder.$loaded().then(function() {
            if ($scope.running != false) {
                L.marker([curOrder.dest[1], curOrder.dest[0]]).addTo(hongkongMap).bindPopup("Destination of delivery order: <b>"+curOrder.$id.toString()+"</b>.");
            }
            console.log(curOrder.dest[1]);
            console.log(curOrder.dest[0]);
            curOrder.depart_time = new Date().getTime();
            curOrder.$save();
        });
        curUser.$loaded().then(function(){
            curUser.position[0] = 114.1500000;
            curUser.position[1] = 22.28790;
            curUser.$save();
            var marker = L.marker([curUser.position[1], curUser.position[0]]).addTo(hongkongMap);

            // dest 114.163 22.28113
            // source 114.1500 22.28790
            $scope.onTimeout = function(){
                if (curUser.position[1] > 22.2859 || curUser.position[1] < 22.2828) {
                    curUser.position[1] = curUser.position[1] - 0.00007;
                    curUser.position[0] = curUser.position[0] + 0.0002;
                }
                else {
                    curUser.position[1] = curUser.position[1] - 0.00012;
                    curUser.position[0] = curUser.position[0] + 0.0001;
                }

                curUser.$save();
                marker.setLatLng([curUser.position[1], curUser.position[0]]).update();
                if (curUser.position[1] > 22.2812) {
                    $scope.mytimeout = $timeout($scope.onTimeout,200);
                }

            }
            if ($scope.running != false) {
                $scope.mytimeout = $timeout($scope.onTimeout,300);
            }
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

    };

    //page initializations
    $scope.currentUserID = "idu3";
    $scope.loadThisReceiver($scope.currentUserID);
    $scope.showDriverTracking = false;

});

receiverApp.controller('driverTrackController', function ($scope, $rootScope, $timeout, $firebaseObject, $firebaseArray, $window) {

});