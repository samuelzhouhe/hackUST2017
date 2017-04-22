/**
 * Created by samuelhe on 22/4/2017.
 */

var driverApp = angular.module('driverApp', []);   //add modules in [] like 'firebase'
driverApp.controller('driverAppController', function ($scope) {
    $scope.helloMsg = "hello driver!";
});