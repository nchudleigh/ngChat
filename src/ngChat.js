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
                url : new RegExp("^"+
                          // protocol identifier
                          "(?:(?:https?|ftp)://)" +
                          // user:pass authentication
                          "(?:\\S+(?::\\S*)?@)?" +
                          "(?:" +
                              // IP address exclusion
                              // private & local networks
                              "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
                              "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
                              "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
                              // IP address dotted notation octets
                              // excludes loopback network 0.0.0.0
                              // excludes reserved space >= 224.0.0.0
                              // excludes network & broacast addresses
                              // (first & last IP address of each class)
                              "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
                              "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
                              "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
                          "|" +
                              // host name
                              "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
                              // domain name
                              "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
                              // TLD identifier
                              "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
                          ")" +
                          // port number
                          "(?::\\d{2,5})?" +
                          // resource path
                          "(?:/\\S*)?" +
                      "$", "i"),
                youtube : /(?:https?:\/\/|www\.|m\.|^)youtu(?:be\.com\/watch\?(?:.*?&(?:amp;)?)?v=|\.be\/)([\w‌​\-]+)(?:&(?:amp;)?[\w\?=]*)?/i
            }
        };
        // public data and functions
        var data={};

        data.mentions = function(input){
            return input;
        };

        data.urls = function(input){
            console.log('url', input.match(pdata.regex.url))
            return input;
        };

        data.images = function(input){
            return input;
        };

        data.videos = function(input){
            var result = pdata.regex.youtube.exec(input);
            console.log(result);

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
                    }
                    if(settings.videos){
                        scope.content = parseChat.videos(scope.content);
                    }
                    if(settings.images){
                        scope.content = parseChat.images(scope.content);
                    }
                    scope.content = parseChat.makeSafe(scope.content);
                };

                scope.$watch('input', scope.processInput);
            }

        }
    }])

;}(window, document, angular));
