(function(window, document, angular){
    'use strict';

    angular.module('demo', [
        'nchudleigh.ngchat'
    ])

    .run(function(){

    })

    .controller('demoController',['$scope',function($scope){
        $scope.test = ''
    }])

;}(window, document, angular));
