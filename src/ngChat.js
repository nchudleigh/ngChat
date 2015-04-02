(function(window, document, angular) {
    'use strict';

    angular.module('nchudleigh.ngchat',[])

    .config(function ($httpProvider) {
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    })

    .service('parseChat', [ '$sce', function($sce){
        // public data and functions
        var pdata = {
            regex : {
                image : new RegExp("\.(gif|png|jpe?g)$"),
                url : /((https?:\/\/)?[a-z]*\.?[a-z]+\.[a-z]+(\/[^\s]*)?)/g,
                youtube : /(?:https?:\/\/|www\.|m\.|^)youtu(?:be\.com\/watch\?(?:.*?&(?:amp;)?)?v=|\.be\/)([\w‌​\-]+)(?:&(?:amp;)?[\w\?=]*)?/i
            }
        };
        // public data and functions
        var data={};

        data.mentions = function(input){
            return input;
        };

        data.urls = function(input){
            console.log('url', pdata.regex.url.exec(input))
            return input;
        };

        data.images = function(input){
            return input;
        };

        data.videos = function(input){
            var result = pdata.regex.youtube.exec(input);
            if(result!==null){
                var id =  result[1];
                var res = "<iframe src='https://www.youtube.com/embed/"+id+"' width='300' height='300' allowfullscreen></iframe>";
                return input+res;
            }
            return input;
        };

        data.makeSafe = function(input){
            return $sce.trustAsHtml(input);
        };



        return data;

    }])

    .directive('ngChat', ['parseChat',function(parseChat) {
        return {
            restrict: 'EA',
            templateUrl: 'src/ngChat.html',
            scope:{
                input:'=',
                settings:'='
            },
            link: function(scope, elem, attrs){

                var settingsDefault = {
                    mentions:true,
                    urls:true,
                    videos:true,
                    images:true
                }

                var settings = scope.settings?scope.settings:settingsDefault;

                scope.processInput = function(){
                    scope.content = scope.input;
                    if(settings.mentions){
                        scope.content = parseChat.mentions(scope.content);
                    }
                    if(settings.urls){
                        scope.content = parseChat.urls(scope.content);
                        if(settings.videos){
                            scope.content = parseChat.videos(scope.content);
                        }
                        if(settings.images){
                            scope.content = parseChat.images(scope.content);
                        }
                    }
                    scope.content = parseChat.makeSafe(scope.content);
                };

                scope.$watch('input', scope.processInput);
            }

        }
    }])

;}(window, document, angular));
