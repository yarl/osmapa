/* global L, angular */
(function () {
  'use strict';
  angular
          .module('osmapa.main')
          .directive('ngLeaflet', ngLeaflet);

  function ngLeaflet() {
    return {
      restrict: 'A',
      replace: true,
      require: '^ngModel',
      template: '<div id="map"></div>',
      scope: {
        ngModel: '=',
        ngLayers: '=',
        ngAction: '='
      },
      controller: ['$scope', '$http', '$location', '$timeout', '$rootScope', function ($scope, $http, $location, $timeout, $rootScope) {

          $scope.changeLayer = function (shortcut) {
            for (var i in $scope.ngLayers) {
              var layer = $scope.ngLayers[i];
              if (layer.shortcut === shortcut) {
                $scope.layers.clearLayers().addLayer(new L.TileLayer(layer.url));
                $scope.ngModel.layer = layer.shortcut;
                $scope.updateHash();
                break;
              }
            }
          };

          $scope.changeOverlay = function (shortcuts) {
            console.log(shortcuts.join('/'));
          };

          $scope.checkAndChangePosition = function (position) {
            var latChange = $scope.ngModel.lat != position.lat,
                    lngChange = $scope.ngModel.lng != (position.lon || position.lng),
                    zoomChange = $scope.ngModel.zoom != (position.z || position.zoom);

            if (latChange || lngChange || zoomChange) {
              $timeout(function () {
                $scope.map.setView([position.lat, position.lon || position.lng], position.z || position.zoom);
              }, 0);
            }
          };

          $scope.changePosition = function () {
            var latChange = $scope.ngModel.lat != $scope.map.getCenter().lat.toFixed(5),
                    lngChange = $scope.ngModel.lng != $scope.map.getCenter().lng.toFixed(5),
                    zoomChange = $scope.ngModel.zoom != $scope.map.getZoom();

            if (latChange || lngChange || zoomChange) {
              $timeout(function () {
                $scope.map.setView([$scope.ngModel.lat, $scope.ngModel.lng], $scope.ngModel.zoom);
              }, 0);
            }
          };

          $scope.updateHash = function () {
            var map = $scope.map;
            $timeout(function () {
              $rootScope.$apply(function () {
                $scope.ngModel.lat = (map.getCenter().lat).toFixed(5);
                $scope.ngModel.lng = (map.getCenter().lng).toFixed(5);
                $scope.ngModel.zoom = map.getZoom();

                $location.path('/lat=' + $scope.ngModel.lat
                        + '&lon=' + $scope.ngModel.lng
                        + '&z=' + $scope.ngModel.zoom
                        + '&m=' + $scope.ngModel.layer);
              });
            }, 0);
          };

          $scope.fitBounds = function (bbox) {
            if (!bbox[0] || !bbox[1]) {
              return;
            }
            $timeout(function () {
              $scope.map.fitBounds(bbox);
            }, 0);
          };

          $scope.geoLocalize = function () {
            $scope.map.locate({setView: true, maxZoom: 16});
          };

          $scope.mapClick = function (e) {
            //http://codepen.io/440design/pen/iEztk
            var ink;
            var mapContainer = $scope.map._container;

            if (!mapContainer.getElementsByClassName("map-ripple-ink").length) {
              ink = document.createElement("span");
              ink.className = "map-ripple-ink";
              mapContainer.insertBefore(ink, mapContainer.childNodes[0]);    
            }

            ink = mapContainer.children[0];
            ink.classList.remove("map-ripple-animation");

            setTimeout(function() {
              ink.style.top = e.containerPoint.y - 50 + "px";
              ink.style.left = e.containerPoint.x - 50 + "px";
              ink.classList.add("map-ripple-animation");
            }, 50);
          };

          $scope.$watch(function () {
            return $location.path();
          }, function (_new, _old) {
            var params = {}, path = _new.substring(1).split("&");
            for (var i in path) {
              var pair = path[i].split("=");
              params[pair[0]] = pair[1];
            }

            if (params.lat && params.lon && params.z) {
              $scope.checkAndChangePosition(params);
            }

            if (params.m && $scope.ngModel.layer !== params.m) {
              $scope.changeLayer(params.m);
            }
          });
        }],
      
      link: function (scope, iElement, iAttrs, ctrl) {
        var model = scope.ngModel;
        scope.layers = new L.LayerGroup();
        scope.overlays = new L.LayerGroup();
        scope.objects = new L.LayerGroup();

        /* map config and init */

        scope.map = L.map('map', {
          minZoom: 3,
          layers: [scope.layers, scope.overlays, scope.objects],
          zoomControl: false
        }).setView([model.lat, model.lng], model.zoom);

        scope.map.attributionControl.setPrefix("");
        scope.map.addControl(new L.Control.Zoom({position: 'bottomleft'}));
        
        scope.changeLayer(model.layer);
        scope.updateHash();

        /* events */

        scope.map.on('moveend', function (e) {
          scope.updateHash();
        });

        scope.map.on('click', function (e) {
          scope.mapClick(e);
        });

        /* watches */

        scope.$watch('ngModel', function (_new, _old) {
          if (_new.layer !== _old.layer) {
            scope.changeLayer(_new.layer);
            return;
          }

          if (_new.overlay.length !== _old.overlay.length) {
            scope.changeOverlay(_new.overlay);
            return;
          }

          scope.changePosition(_new);
        }, true);

        scope.$watch('ngAction', function (name) {
          if (angular.isArray(name)) {
            scope.fitBounds(name);
          }

          if (name === "geoloc") {
            scope.geoLocalize();
            scope.ngAction = "";
          }
        }, true);
      }
    };
  }
})();