/**
 * Created by samuelhe on 22/4/2017.
 */

var senderApp = angular.module('senderApp', []);   //add modules in [] like 'firebase'
senderApp.controller('senderAppController', function ($scope) {
    $scope.helloMsg = "hello receiver!";
});