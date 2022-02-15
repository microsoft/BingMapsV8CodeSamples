'use strict';
ngBingMaps.directive('map', [function ($compile) {
    return {
        restrict: 'E',
        controller: ['$scope', function ($scope) {
            this.buffer_pushpins = [];
            this.mapHtmlEl = null
            this.map = null;

            this.exeFunc = function (func, context, args) {
                $scope.$parent[func].apply(context, args);
            }

            this.addPushpin = function (pushpin) {
                if (this.map) {
                    this.map.entities.push(pushpin);
                }
                else {
                    this.buffer_pushpins.push(pushpin);
                }
            }

            this.removePushpin = function (pushpin) {
                this.map.entities.remove(pushpin);
            }

            this.initializePushpins = function () {
                for (var i = 0; i < this.buffer_pushpins.length; i++) {
                    var pushpin = this.buffer_pushpins[i];

                    if (this.map) {
                        this.map.entities.push(pushpin);
                    }
                }
            }

            this.initializeMap = function (scope, elem, attrs) {
                var map_canvas = document.createElement('div');
                map_canvas.style.width = attrs.width;
                map_canvas.style.height = attrs.height;
                var _thisCtrl = this;

                var def_coords = eval(attrs.center);

                _thisCtrl.map = new Microsoft.Maps.Map(map_canvas, {
                    center: new Microsoft.Maps.Location(def_coords[0], def_coords[1]),
                    mapTypeId: 'a',
                    zoom: 18
                });

                _thisCtrl.initializePushpins();

                $(this.mapHtmlEl).append('<span ng-transclude></span>')
                this.mapHtmlEl = map_canvas;
            }

            this.setCenter = function (position) {
                var position = eval(position)
                var _position = new Microsoft.Maps.Location(position[0], position[1])
                if (this.map) {
                    this.map.setView({ center: _position });
                }
            }
        }],
        scope: {
            'center': '@',
        },
        link: function (scope, element, attrs, ctrl) {
            scope.$watch('center', function (center) {
                if (center) {
                    ctrl.setCenter(center);
                }
            }, false);

            if (!window.mapScriptLoaded) {
                //Wait for map API to be loaded before loading map. 
                window.mapScriptLoadCallback = function () {
                    ctrl.initializeMap(scope, element, attrs);
                    element.append(ctrl.mapHtmlEl);

                    window.mapScriptLoaded = true;
                };
            } else {
                ctrl.initializeMap(scope, element, attrs);
                element.append(ctrl.mapHtmlEl);
            }
        }
    }
}]);

ngBingMaps.directive('pushpin', [function ($compile) {
    return {
        restrict: 'E',
        require: '^map',
        controllerAs: 'pushpin',
        link: function (scope, element, attrs, mapController) {
            var getPushpin = function () {
                var lat = attrs.lat
                var lng = attrs.lng;
                var text = attrs.text;
                var color = attrs.color;

                var location = new Microsoft.Maps.Location(lat, lng);

                var pushpin = new Microsoft.Maps.Pushpin(location, {
                    text: text,
                    color: color
                });

                if (attrs.click) {
                    var matches = attrs.click.match(/([^\(]+)\(([^\)]*)\)/);
                    var funcName = matches[1];
                    var argsStr = matches[2]
                    var args = scope.$eval("[" + argsStr + "]");

                    var pushpinListener = function () {
                        mapController.exeFunc(funcName, this, args);
                    };

                    Microsoft.Maps.Events.addHandler(pushpin, 'click', pushpinListener);
                }

                return pushpin;
            };

            var loadPushpins = function () {
                if (window.mapScriptLoaded) {
                    var pushpin = getPushpin();
                    mapController.addPushpin(pushpin);

                    scope.$on('$destroy', function () {
                        mapController.removePushpin(pushpin);
                    });
                } else {
                    setTimeout(loadPushpins, 100);
                }          
            };

            loadPushpins();       
        }
    }
}]);


