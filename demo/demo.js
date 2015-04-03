(function(window, document, angular){
    'use strict';

    angular.module('demo', [
        'nchudleigh.ngchat'
    ])

    .run(function(){

    })

    .controller('demoController',['$scope',function($scope){
        $scope.test = ' http://media.giphy.com/media/1026x5Ybk81eRW/giphy.gif'
    }])

;}(window, document, angular));
