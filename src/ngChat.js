(function(window, document, angular) {
    'use strict';

    angular.module('nchudleigh.ngchat',[])

    // .config(function ($httpProvider) {
    //     delete $httpProvider.defaults.headers.common['X-Requested-With'];
    // })

    .service('ngChatService', [ '$sce', function($sce){
        // public data and functions
        var pdata = {
            regex : {
                mention : /\B[@]([0-z]+)/gmi,
                image : /\.(gif|png|jpe?g)$/i,
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
        // bad practice, you need to change this to something that wont override all their shit.
        String.prototype.splice = function(index, length, replacement){
            return this.slice(0, index)+replacement+this.slice(index+length, this.length);
        }

        pdata.appendElement = function(returnElement, matches, input){
            var tmp;
            for( var i=0; i<matches.length; i++){
                if (matches[i] !== null){
                    tmp=returnElement(matches[i].src);
                    if(tmp!==null){
                        input+=tmp;
                    }
                }
            }
            return input;
        };


        pdata.images = function(input){
            var match = pdata.regex.image.exec(input);
            if(match!==null){
                return "<img src='"+input+"' style='max-width:300px;'></img>";
            }
            return null;
        };

        pdata.videos = function(input){
            var match = pdata.regex.youtube.exec(input);
            if(match!==null){
                return "<iframe src='https://www.youtube.com/embed/"+ match[1]+"' width='300' height='300' allowfullscreen></iframe>";
            }
            return null;
        };

        pdata.mentions = function(input){
            var matches=[]
            matches = matchAll(pdata.regex.mention, input);
            if (matches.length == 0 )return matches;
            var inputLen = input.length;
            for( var i=0; i<matches.length; i++){
                if(matches[i]==null) break;
                if (inputLen < input.length) matches[i].idx += (input.length - inputLen);
                input = input.splice(matches[i].idx, matches[i].src.length, "<a id='ng-chat-mention' class='mention' ng-click='mentionClick()'>"+matches[i].src+"</a>");
            }
            return input;
        };

        data.parse = function(input, settings, callback){
            if ( !input || input.length == 0 )return;
            var matches = matchAll(pdata.regex.url, input);
            if (matches.length == 0 )return;
            // this is used to increase the indexes given with the matches to the
            // augmented input string
            var initlen = input.length;
            // replace the found urls with a tags
            if(settings.urls){
                for( var i=0; i<matches.length; i++){
                    // if the match is null your at the end of the array
                    if (matches[i] == null) break;
                    // adjust for augmented string
                    if (initlen < input.length) matches[i].idx += (input.length - initlen);
                    // if http is missing, add it to the href
                    if (/https?/.exec(matches.src)==null){ matches[i].href = "http://"+matches[i].src}
                    else matches[i].href=matches[i].src;
                    // replace the matched string with the a element
                    input = input.splice(matches[i].idx, matches[i].src.length, "<a target='_blank' href='"+matches[i].href+"'>"+matches[i].src+"</a>");
                }
                //append youtube iframe if url matches
                if(settings.videos){
                    input = pdata.appendElement(pdata.videos, matches, input);
                }

                //append image to message if url matches
                if(settings.images){
                    input = pdata.appendElement(pdata.images, matches, input)
                }
            }

            if(settings.mentions){
                input = pdata.mentions(input);
            }
            return input;
        };


        data.makeSafe = function(input){
            return $sce.trustAsHtml(input);
        };

        return data;

    }])

    .directive('ngChat', ['ngChatService','$compile',function(ngChatService, $compile) {
        return {
            restrict: 'EA',
            templateUrl: 'src/ngChat.html',
            scope:{
                mentionClick:'=mentionFunction',
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
                    scope.content = ngChatService.parse(scope.content, settings);
                    scope.content = ngChatService.makeSafe(scope.content);
                };

                scope.$watch('input', scope.processInput);
            }

        }
    }])

;}(window, document, angular));
