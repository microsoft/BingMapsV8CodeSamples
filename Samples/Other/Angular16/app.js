var ngBingMaps = angular.module('ngBingMaps', []);
ngBingMaps.controller('MainCtrl', function ($scope) {

    $scope.title = "Bing Maps V8 with Angular 1.6 Sample";
    $scope.center = [43.000, 13.0000];

    $scope.pushpins = [{
        latitude: 43.000,
        longitude: 13.0000,
        text: 'hi',
        color: 'red'
    }, {
        latitude: 43.0005,
        longitude: 13.0005,
        text: 'ok',
        color: 'blue'
    }];

    $scope.onPushpinClick = function (pin) {
        alert(pin.color + ' pin clicked');
    };
});