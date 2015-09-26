/* global L, angular */
(function () {
  'use strict';
  angular
          .module('osmapa.map', ['ngAnimate', 'ngMaterial'])
          .directive('osmapaMap', function (model, infoboxService, mapService) {
            return {
              scope: {},
              templateUrl: 'js/map/map.tpl.html',
              replace: true,
              controller: 'MapController',
              controllerAs: 'ctrl',
              link: mapLink,
              bindToController: true
            };

            function mapLink(scope, iElement, iAttrs, ctrl) {
              ctrl.layers = new L.LayerGroup();
              ctrl.overlays = new L.LayerGroup();
              ctrl.shownObjects = new L.FeatureGroup();

              /* map config and init */

              var leaflet = L.map('map', {
                minZoom: 3,
                layers: [ctrl.overlays, ctrl.layers],
                zoomControl: false,
                detectRetina: true,
                maxZoom: 19
              }).setView([model.map.lat, model.map.lng], model.map.zoom);

              leaflet.attributionControl.setPrefix("");
              leaflet.addControl(new L.Control.Zoom({position: 'bottomleft'}));
              leaflet.addLayer(ctrl.shownObjects);

              ctrl.changeLayer(model.map.layer);
              ctrl.updateHash();

              /* interface */

              ctrl.getMap = function () {
                return leaflet;
              };

              ctrl.getMapBounds = function () {
                return leaflet.getBounds();
              };

              ctrl.getMapLat = function () {
                return leaflet.getCenter().lat;
              };

              ctrl.getMapLng = function () {
                return leaflet.getCenter().lng;
              };

              ctrl.getMapZoom = function () {
                return leaflet.getZoom();
              };

              ctrl.setMapBounds = function (bbox) {
                leaflet.fitBounds(bbox);
              };

              ctrl.setMapView = function (view) {
                leaflet.setView([view.lat, view.lng], view.zoom);
              };

              /* events */

              leaflet.on('moveend', function (e) {
                ctrl.updateHash();
              });

              leaflet.on('click', function (e) {
                if (model.show.infobox) {
                  infoboxService.hide();
                } else if (leaflet.getZoom() > 13) {
                  ctrl.loadData(e);
                }
              });

              if (L.Browser.touch) {
                leaflet.on('contextmenu', function (e) {
                  if (leaflet.getZoom() > 13) {
                    ctrl.loadData(e);
                  }
                });
              }

              /**
               * watch map
               */
              scope.$watch(function () {
                return model.map;
              }, function (newVal, oldVal) {
                if (newVal.layer !== oldVal.layer) {
                  ctrl.changeLayer(newVal.layer);
                  return;
                }
                if (newVal.overlay.length !== oldVal.overlay.length) {
                  ctrl.changeOverlay(newVal.overlay);
                  return;
                }
                ctrl.changePosition(newVal);
              }, true);

              /**
               * watch action
               */
              scope.$watch(function () {
                return mapService.action;
              }, function (value) {

                if (value.type === "ZOOM_TO_BOUNDARY") {
                  angular.isArray(value.data) ?
                          ctrl.zoomToBoundary(value.data) :
                          console.log("ZOOM_TO_BOUNDARY: data not an array!");
                }
                else if (value.type === "GEOLOC") {
                  ctrl.geoLocalize();
                }
                else if (value.type === "DRAW_OBJECT") {
                  if (value.clean) {
                    ctrl.shownObjects.clearLayers();
                  }
                  if (value.data) {
                    ctrl.shownObjects.addLayer(value.data);
                  }
                }
                mapService.action = {};
              }, true);
            }

          })
          .controller('MapController', MapController);

  function MapController(model, $scope, $location, $timeout, $rootScope, searchService, infoboxService) {
    var ctrl = this;

    ctrl.changeLayer = changeLayer;
    ctrl.changeOverlay = changeOverlay;
    ctrl.changePosition = changePosition;
    ctrl.geoLocalize = geoLocalize;
    ctrl.loadData = loadData;
    ctrl.mapClick = mapClick;
    ctrl.updateHash = updateHash;
    ctrl.zoomToBoundary = zoomToBoundary;

    /* functions */

    function changeLayer(shortcut) {
      for (var i in model.layers) {
        var layer = model.layers[i];
        if (layer.shortcut === shortcut) {
          //@TODO: configurable maxZoom
          ctrl.layers.clearLayers().addLayer(new L.TileLayer(layer.url, {
            maxZoom: 19
          }));
          model.map.layer = layer.shortcut;
          updateHash();
          break;
        }
      }
    }

    function changeOverlay(overlays) {
      ctrl.overlays.clearLayers();

      for (var i in overlays) {
        var layer = model.overlays[overlays[i]];
        if (!layer) {
          continue;
        }
        ctrl.overlays.addLayer(new L.TileLayer(layer.url, {
          maxZoom: 19,
          zIndex: layer.zIndex
        }));
      }
      model.map.overlay = overlays;
      updateHash();
    }

    function changePosition(position) {
      var latChange = model.map.lat != position.lat;
      var lngChange = model.map.lng != (position.lon || position.lng);
      var zoomChange = model.map.zoom != (position.z || position.zoom);

      if (latChange || lngChange || zoomChange) {
        $timeout(function () {
          ctrl.setMapView({
            lat: position.lat,
            lng: position.lon || position.lng,
            zoom: position.z || position.zoom
          });
        }, 0);
      }

      latChange = model.map.lat != ctrl.getMapLat().toFixed(5);
      lngChange = model.map.lng != ctrl.getMapLng().toFixed(5);
      zoomChange = model.map.zoom != ctrl.getMapZoom();

      if (latChange || lngChange || zoomChange) {
        $timeout(function () {
          ctrl.setMapView({
            lat: model.map.lat,
            lng: model.map.lng,
            zoom: model.map.zoom
          });
        }, 0);
      }
    }

    function geoLocalize() {
      ctrl.getMap().locate({setView: true, maxZoom: 16});
    }

    function loadData(e) {
      mapClick(e);
      infoboxService.getMapillary({lat: e.latlng.lat, lng: e.latlng.lng});
      infoboxService.show();
      infoboxService.setLoadingState(true);
      ctrl.shownObjects.clearLayers();
      searchService.overpass(e.latlng, ctrl.getMapBounds(), ctrl.getMapZoom()).then(function (data) {
        console.log(data);
        infoboxService.setLoadingState(false);
        model.map.objects = data;
        model.map.objectsPosition = [e.latlng.lat, e.latlng.lng];
      });
    }
    
    function mapClick(e) {
      // http://codepen.io/440design/pen/iEztk
      var ink;
      var mapContainer = ctrl.getMap()._container;

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

    var prevHash = "";
    function updateHash() {
      $timeout(function () {
        $rootScope.$apply(function () {
          model.map.lat = ctrl.getMapLat().toFixed(5);
          model.map.lng = ctrl.getMapLng().toFixed(5);
          model.map.zoom = ctrl.getMapZoom();

          var hash = '/lat=' + model.map.lat + '&lon=' + model.map.lng;
          hash += '&z=' + model.map.zoom + '&m=' + model.map.layer;
          hash += model.map.overlay.length ? '&o=' + model.map.overlay.join('/') : '';

          if (hash !== prevHash) {
            prevHash = hash;
            $location.path(hash);
          }
        });
      }, 0);
    }

    function zoomToBoundary(bbox) {
      if (!bbox[0] || !bbox[1]) {
        return;
      }
      $timeout(function () {
        ctrl.setMapBounds(bbox);
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

      if (params.m && model.map.layer !== params.m) {
        changeLayer(params.m);
      }

      if (params.o && model.map.overlay.join('/') !== params.o) {
        changeOverlay(params.o.split('/'));
      }
    });
  }
})();