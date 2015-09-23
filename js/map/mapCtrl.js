/* global L, angular */
(function () {
  'use strict';
  angular
          .module('osmapa.map', ['ngAnimate', 'ngMaterial'])
          .directive('osmapaMap', function (searchService) {
            return {
              scope: {
                mapData: '=',
                mapLayers: '=',
                mapAction: '=',
                show: '='
              },
              templateUrl: 'js/map/map.tpl.html',
              replace: true,
              controller: 'MapController',
              controllerAs: 'ctrl',
              link: MapLink,
              bindToController: true
            };

            function MapLink(scope, iElement, iAttrs, ctrl) {
              var map = ctrl.mapData;
              var show = ctrl.show;
              ctrl.layers = new L.LayerGroup();
              ctrl.overlays = new L.LayerGroup();
              ctrl.shownObjects = new L.FeatureGroup();

              /* map config and init */

              ctrl.map = L.map('map', {
                minZoom: 3,
                layers: [ctrl.layers, ctrl.overlays],
                zoomControl: false,
                detectRetina: true,
                maxZoom: 19
              }).setView([map.lat, map.lng], map.zoom);

              ctrl.map.attributionControl.setPrefix("");
              ctrl.map.addControl(new L.Control.Zoom({position: 'bottomleft'}));
              ctrl.map.addLayer(ctrl.shownObjects);

              ctrl.changeLayer(map.layer);
              ctrl.updateHash();

              /* events */

              ctrl.map.on('moveend', function (e) {
                ctrl.updateHash();
              });

              ctrl.map.on('click', function (e) {
                if (ctrl.map.getZoom() > 13) {
                  loadData(e);
                }
              });

              if (L.Browser.touch) {
                ctrl.map.on('contextmenu', function (e) {
                  if (ctrl.map.getZoom() > 13) {
                    loadData(e);
                  }
                });
              }

              function loadData(e) {
                ctrl.mapClick(e);
                show.infobox = true;
                show.infoboxLoading = true;
                searchService.overpass(e.latlng, ctrl.map.getBounds(), ctrl.map.getZoom()).then(function (data) {
                  console.log(data);
                  show.infoboxLoading = false;
                  map.objects = data;
                  map.objectsPosition = [e.latlng.lat, e.latlng.lng];
                });
              }

              /* watches */

              scope.$watch('ctrl.mapData', function (_new, _old) {
                if (_new.layer !== _old.layer) {
                  ctrl.changeLayer(_new.layer);
                  return;
                }
                if (_new.overlay.length !== _old.overlay.length) {
                  ctrl.changeOverlay(_new.overlay);
                  return;
                }
                ctrl.changePosition(_new);
              }, true);

              scope.$watch('ctrl.mapAction', function (input) {
                if (angular.isArray(input)) {
                  ctrl.zoomToBoundary(input);
                }
                else if (input === "geoloc") {
                  ctrl.geoLocalize();
                }
                else if (angular.isObject(input)) {
                  ctrl.shownObjects.clearLayers();
                  if (input._latlng || input._latlngs) {
                    ctrl.shownObjects.addLayer(input);
                  }
                }
                ctrl.mapAction = "";
              }, true);
            }

          })
          .controller('MapController', MapController);

  function MapController($scope, $location, $timeout, $rootScope) {
    var ctrl = this;
    
    ctrl.changeLayer = changeLayer;
    ctrl.changeOverlay = changeOverlay;
    ctrl.changePosition = changePosition;
    ctrl.geoLocalize = geoLocalize;
    ctrl.mapClick = mapClick;
    ctrl.updateHash = updateHash;
    ctrl.zoomToBoundary = zoomToBoundary;

    /* functions */

    function changeLayer(shortcut) {
      for (var i in ctrl.mapLayers) {
        var layer = ctrl.mapLayers[i];
        if (layer.shortcut === shortcut) {
          //@TODO: configurable maxZoom
          ctrl.layers.clearLayers().addLayer(new L.TileLayer(layer.url, {
            maxZoom: 19
          }));
          ctrl.mapData.layer = layer.shortcut;
          updateHash();
          break;
        }
      }
    }

    function changeOverlay(shortcuts) {
      console.log(shortcuts.join('/'));
    }

    function changePosition(position) {
      var latChange = ctrl.mapData.lat != position.lat;
      var lngChange = ctrl.mapData.lng != (position.lon || position.lng);
      var zoomChange = ctrl.mapData.zoom != (position.z || position.zoom);

      if (latChange || lngChange || zoomChange) {
        $timeout(function () {
          ctrl.map.setView([position.lat, position.lon || position.lng], position.z || position.zoom);
        }, 0);
      }

      latChange = ctrl.mapData.lat != ctrl.map.getCenter().lat.toFixed(5);
      lngChange = ctrl.mapData.lng != ctrl.map.getCenter().lng.toFixed(5);
      zoomChange = ctrl.mapData.zoom != ctrl.map.getZoom();

      if (latChange || lngChange || zoomChange) {
        $timeout(function () {
          ctrl.map.setView([ctrl.mapData.lat, ctrl.mapData.lng], ctrl.mapData.zoom);
        }, 0);
      }
    }

    function geoLocalize() {
      ctrl.map.locate({setView: true, maxZoom: 16});
    }

    function mapClick(e) {
      // http://codepen.io/440design/pen/iEztk
      var ink;
      var mapContainer = ctrl.map._container;

      if (!mapContainer.getElementsByClassName("map-ripple-ink").length) {
        ink = document.createElement("span");
        ink.className = "map-ripple-ink";
        mapContainer.insertBefore(ink, mapContainer.childNodes[0]);
      }

      ink = mapContainer.children[0];
      ink.classList.remove("map-ripple-animation");

      $timeout(function () {
        ink.style.top = e.containerPoint.y - 50 + "px";
        ink.style.left = e.containerPoint.x - 50 + "px";
        ink.classList.add("map-ripple-animation");
      }, 50);
    }

    function updateHash() {
      $timeout(function () {
        $rootScope.$apply(function () {
          ctrl.mapData.lat = (ctrl.map.getCenter().lat).toFixed(5);
          ctrl.mapData.lng = (ctrl.map.getCenter().lng).toFixed(5);
          ctrl.mapData.zoom = ctrl.map.getZoom();

          $location.path('/lat=' + ctrl.mapData.lat + '&lon=' + ctrl.mapData.lng
                  + '&z=' + ctrl.mapData.zoom + '&m=' + ctrl.mapData.layer);
        });
      }, 0);
    }

    function zoomToBoundary(bbox) {
      if (!bbox[0] || !bbox[1]) {
        return;
      }
      $timeout(function () {
        ctrl.map.fitBounds(bbox);
      }, 0);
    }

    /* watches */

    $scope.$watch(function () {
      return $location.path();
    }, function (_new, _old) {
      var params = {}, path = _new.substring(1).split("&");
      for (var i in path) {
        var pair = path[i].split("=");
        params[pair[0]] = pair[1];
      }

      if (params.lat && params.lon && params.z) {
        changePosition(params);
      }

      if (params.m && ctrl.mapData.layer !== params.m) {
        changeLayer(params.m);
      }
    });
  }
})();