/**
 * Created by samuelhe on 22/4/2017.
 */

var driverApp = angular.module('driverApp', ["firebase"]);   //add modules in [] like 'firebase'
driverApp.controller('driverAppController', function ($scope,$firebaseObject,$firebaseArray) {
	//initialize data lists
	
    $scope.passengerList = $firebaseObject(firebase.database().ref("order_passenger"));
    $scope.thisDriver = $firebaseObject(firebase.database().ref("driver").child("idd1"));
    var packages = $firebaseObject(firebase.database().ref("order_delivery"));
    $scope.unConfirmedPackages = {};
    $scope.available;
    var ref = firebase.database().ref("order_passenger");
    $scope.noPassenger = true;
    $scope.currentPassenger;
	ref.on('value',function(snapshot){
		
        var available = snapshot.child("available").val();
        if(available.length >= 2){
            $scope.available = $firebaseArray(firebase.database().ref("order_passenger").child("available"));
            $scope.available.$loaded(function(){
                $scope.noPassenger = false;
                $scope.currentPassenger = $scope.passengerList['ido1'];
            });
		}
        else{
            $scope.noPassenger = true;
        }
	});
    var packageList = {};
    $scope.confirm = function(){
        //$scope.available.$remove(1);
        $scope.ConfirmPassenger = true;
        var i = 0;
        packages.$loaded(function(){
            angular.forEach(packages,function(value,key){
                if(value['status'] == 'confirmedByReceiver'){
                    $scope.unConfirmedPackages[key] = value;
                    packageList[i] = key;
                    i ++;
                }
            });
    });
    };

    $scope.currentPackage = {};
    var currentPackageKey;
    $scope.viewPackage = function(index){
        currentPackageKey = packageList[index];
        $scope.currentPackage = packages[currentPackageKey];
        //alert(currentPackageKey);
    };
    $scope.confirmedPackages = {};
    $scope.hasConfirmedPackage = false;
    $scope.confirmPackage = function(){
        //alert("sssssss");
                //alert("sssssss");
                packages[currentPackageKey]['status'] = "confirmedByDriver";
                packages[currentPackageKey]['driver'] =  $scope.thisDriver['name'];
                $scope.confirmedPackages[currentPackageKey] = packages[currentPackageKey];
                packages.$save();
                //alert("sssssss");
                $scope.unConfirmedPackages = {};
                packageList = [];
                var i = 0;
                angular.forEach(packages,function(value,key){
                    if(value['status'] == 'confirmedByReceiver'){
                        $scope.unConfirmedPackages[key] = value;
                        packageList[i] = key;
                        i ++;
                    }
                });
            $scope.hasConfirmedPackage = true;
    };
    $scope.currentConfirmedPackage;
    $scope.viewConfirmedPackage = function(key){
        $scope.currentConfirmedPackage = packages[key]
    }

    $scope.helloMsg = "hello driver!";
    $scope.passenger = ['passenger1','passenger2','passenger3'];
    $scope.package = ['package1','package2','package3'];
    $scope.confirmPassenger = false;

});