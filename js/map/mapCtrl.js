/* global L, angular */
(function () {
  'use strict';
  angular
          .module('osmapa.map', ['ngAnimate', 'ngMaterial'])
          .directive('osmapaMap', function (model, searchService) {
            return {
              scope: {},
              templateUrl: 'js/map/map.tpl.html',
              replace: true,
              controller: 'MapController',
              controllerAs: 'ctrl',
              link: MapLink,
              bindToController: true
            };

            function MapLink(scope, iElement, iAttrs, ctrl) {
              var map = model.map;
              var show = model.show;
              
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

              scope.$watch(function(){
                return model.map;
              }, function (_new, _old) {
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

              scope.$watch(function(){
                return model.action;
              }, function (value) {
                
                if(value.type === "ZOOM_TO_BOUNDARY") {
                  angular.isArray(value.data) ? 
                    ctrl.zoomToBoundary(value.data) :
                    console.log("ZOOM_TO_BOUNDARY: data not an array!");
                } 
                else if(value.type === "GEOLOC") {
                  ctrl.geoLocalize();
                }
                else if(value.type === "DRAW_OBJECT") {
                  ctrl.shownObjects.clearLayers();
                  if (value.data && (value.data._latlng || value.data._latlngs)) {
                    ctrl.shownObjects.addLayer(value.data);
                  }
                }
                model.action = {};
              }, true);
            }

          })
          .controller('MapController', MapController);

  function MapController(model, $scope, $location, $timeout, $rootScope) {
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

    function changeOverlay(shortcuts) {
      console.log(shortcuts.join('/'));
    }

    function changePosition(position) {
      var latChange = model.map.lat != position.lat;
      var lngChange = model.map.lng != (position.lon || position.lng);
      var zoomChange = model.map.zoom != (position.z || position.zoom);

      if (latChange || lngChange || zoomChange) {
        $timeout(function () {
          ctrl.map.setView([position.lat, position.lon || position.lng], position.z || position.zoom);
        }, 0);
      }

      latChange = model.map.lat != ctrl.map.getCenter().lat.toFixed(5);
      lngChange = model.map.lng != ctrl.map.getCenter().lng.toFixed(5);
      zoomChange = model.map.zoom != ctrl.map.getZoom();

      if (latChange || lngChange || zoomChange) {
        $timeout(function () {
          ctrl.map.setView([model.map.lat, model.map.lng], model.map.zoom);
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
          model.map.lat = (ctrl.map.getCenter().lat).toFixed(5);
          model.map.lng = (ctrl.map.getCenter().lng).toFixed(5);
          model.map.zoom = ctrl.map.getZoom();

          $location.path('/lat=' + model.map.lat + '&lon=' + model.map.lng
                  + '&z=' + model.map.zoom + '&m=' + model.map.layer);
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

      if (params.m && model.map.layer !== params.m) {
        changeLayer(params.m);
      }
    });
  }
})();