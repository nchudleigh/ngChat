(function(window, document, angular){
    'use strict';

    angular.module('demo', [
        'nchudleigh.ngchat'
    ])

    .run(function(){

    })

    .controller('demoController',['$scope',function($scope){
        $scope.test = ' this is a stupid test https://www.youtube.com/watch?v=txuWGoZF3ew http://media.giphy.com/media/1026x5Ybk81eRW/giphy.gif check out www.google.com'
    }])

;}(window, document, angular));
