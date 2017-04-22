var driverApp = angular.module('driverApp', []);   //add modules in [] like 'firebase'
driverApp.controller('driverAppController', function ($scope) {
    $scope.helloMsg = "hello driver!";
});