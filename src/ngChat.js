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
                url : /((https?:\/\/)?[a-z,0-9,\-]*\.?[a-z,0-9,\-]+\.[a-z,0-9,\-]+(\/[^\s]*)?)/g,
                youtube : /(?:https?:\/\/|www\.|m\.|^)youtu(?:be\.com\/watch\?(?:.*?&(?:amp;)?)?v=|\.be\/)([\w‌​\-]+)(?:&(?:amp;)?[\w\?=]*)?/i
            }
        };
        // public data and functions
        var data={};

        function matchAll(re, str){
            var m=[];// matches
            var i=0;// counter
            // make match objects with the url and the index push into 'm' arr
            while( (m[i] = re.exec(str)) !== null) {
                m[i] = {'src':m[i][0],'idx':m[i].index};
                i++;
            }
            return m;
        };

        String.prototype.splice = function(index, length, replacement){
            console.log(length)
            return this.slice(0, index)+replacement+this.slice(index+length, this.length)
        }

        data.mentions = function(input){
            return input;
        };

        data.urls = function(input, settings){
            var matches = matchAll(pdata.regex.url, input);
            // this is used to increase the indexes given with the matches to the
            // augmented input string
            var initlen = input.length;
            // replace the found urls with a tags
            for( var i=0; i<matches.length; i++){
                if (matches[i] == null) continue;
                if (initlen < input.length) matches[i].idx += (input.length - initlen);
                input = input.splice(matches[i].idx, matches[i].src.length, "<a href='"+matches[i].src+"'>"+matches[i].src+"</a>")
            }
            //append youtube iframe if url matches
            if(settings.videos){
                var tmp;
                for( var i=0; i<matches.length; i++){
                    if (matches[i] !== null){
                        tmp=data.videos(matches[i].src);
                        if(tmp!==null){
                            input+=tmp;
                        }
                    }
                }
            }

            if(settings.images){
                var tmp;
                for( var i=0; i<matches.length; i++){
                    if (matches[i] !== null){
                        tmp=data.images(matches[i].src);
                        if(tmp!==null){
                            input+=tmp;
                        }
                    }
                }
            }
            return input;
        };

        data.images = function(input){
            var match = pdata.regex.image.exec(input);
            if(match!==null){
                return "<img src='"+input+"' style='max-width:300px;'></img>";
            }
            return null;
        };

        data.videos = function(input){
            var match = pdata.regex.youtube.exec(input);
            if(match!==null){
                return "<iframe src='https://www.youtube.com/embed/"+ match[1]+"' width='300' height='300' allowfullscreen></iframe>";
            }
            return null;
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
                        console.log(settings)
                        scope.content = parseChat.urls(scope.content, settings);
                    }
                    scope.content = parseChat.makeSafe(scope.content);
                    console.log(scope.content.toString());
                };

                scope.$watch('input', scope.processInput);
            }

        }
    }])

;}(window, document, angular));
