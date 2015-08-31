/* global L, angular */
(function () {
  'use strict';
  angular
          .module('osmapa.main')
          .directive('ngLeaflet', ngLeaflet);

  function ngLeaflet(searchService) {
    function ngLeafletController($scope, $location, $timeout, $rootScope) {
      var vm = $scope;
      vm._model = vm.ngModel;
      vm._layers = vm.ngLayers;

      vm.changeLayer = changeLayer;
      vm.changeOverlay = changeOverlay;
      vm.changePosition = changePosition;
      vm.geoLocalize = geoLocalize;
      vm.mapClick = mapClick;
      vm.updateHash = updateHash;
      vm.zoomToBoundary = zoomToBoundary;

      /* functions */

      function changeLayer(shortcut) {
        for (var i in vm._layers) {
          var layer = vm._layers[i];
          if (layer.shortcut === shortcut) {
            //@TODO: configurable maxZoom
            vm.layers.clearLayers().addLayer(new L.TileLayer(layer.url, {
              maxZoom: 19
            }));
            vm._model.layer = layer.shortcut;
            updateHash();
            break;
          }
        }
      }

      function changeOverlay(shortcuts) {
        console.log(shortcuts.join('/'));
      }

      function changePosition(position) {
        var latChange = vm._model.lat != position.lat;
        var lngChange = vm._model.lng != (position.lon || position.lng);
        var zoomChange = vm._model.zoom != (position.z || position.zoom);

        if (latChange || lngChange || zoomChange) {
          $timeout(function () {
            vm.map.setView([position.lat, position.lon || position.lng], position.z || position.zoom);
          }, 0);
        }

        latChange = vm._model.lat != vm.map.getCenter().lat.toFixed(5);
        lngChange = vm._model.lng != vm.map.getCenter().lng.toFixed(5);
        zoomChange = vm._model.zoom != vm.map.getZoom();

        if (latChange || lngChange || zoomChange) {
          $timeout(function () {
            vm.map.setView([vm._model.lat, vm._model.lng], vm._model.zoom);
          }, 0);
        }
      }

      function geoLocalize() {
        vm.map.locate({setView: true, maxZoom: 16});
      }

      function mapClick(e) {
        // http://codepen.io/440design/pen/iEztk
        var ink;
        var mapContainer = $scope.map._container;

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
            vm._model.lat = (vm.map.getCenter().lat).toFixed(5);
            vm._model.lng = (vm.map.getCenter().lng).toFixed(5);
            vm._model.zoom = vm.map.getZoom();

            $location.path('/lat=' + vm._model.lat + '&lon=' + vm._model.lng
                    + '&z=' + vm._model.zoom + '&m=' + vm._model.layer);
          });
        }, 0);
      }

      function zoomToBoundary(bbox) {
        if (!bbox[0] || !bbox[1]) {
          return;
        }
        $timeout(function () {
          vm.map.fitBounds(bbox);
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

        if (params.m && $scope.ngModel.layer !== params.m) {
          changeLayer(params.m);
        }
      });
    }

    function ngLeafletLink(scope, iElement, iAttrs, ctrl) {
      var map = scope.ngModel;
      var show = scope.ngShown;
      scope.layers = new L.LayerGroup();
      scope.overlays = new L.LayerGroup();
      scope.shownObjects = new L.FeatureGroup();

      /* map config and init */

      scope.map = L.map('map', {
        minZoom: 3,
        layers: [scope.layers, scope.overlays],
        zoomControl: false,
        detectRetina: true,
        maxZoom: 19
      }).setView([map.lat, map.lng], map.zoom);


      scope.map.attributionControl.setPrefix("");
      scope.map.addControl(new L.Control.Zoom({position: 'bottomleft'}));
      scope.map.addLayer(scope.shownObjects);
      
      scope.changeLayer(map.layer);
      scope.updateHash();

      /* events */

      scope.map.on('moveend', function (e) {
        scope.updateHash();
      });

      scope.map.on('click', function (e) {
        if (scope.map.getZoom() > 13) {
          loadData(e);
        }
      });

      if (L.Browser.touch) {
        scope.map.on('contextmenu', function (e) {
          if (scope.map.getZoom() > 13) {
            loadData(e);
          }
        });
      }

      function loadData(e) {
        scope.mapClick(e);
        show.infobox = true;
        show.infoboxLoading = true;
        searchService.overpass(e.latlng, scope.map.getBounds(), scope.map.getZoom()).then(function (data) {
          console.log(data);
          show.infoboxLoading = false;
          map.objects = data;
          map.objectsPosition = [e.latlng.lat, e.latlng.lng];
        });
      }

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

      scope.$watch('ngAction', function (input) {
        if (angular.isArray(input)) {
          scope.zoomToBoundary(input);
        }
        else if (input === "geoloc") {
          scope.geoLocalize();
        }
        else if(angular.isObject(input)) {
          scope.shownObjects.clearLayers();
          if (input._latlng || input._latlngs) {
            scope.shownObjects.addLayer(input);
          }
        }
        scope.ngAction = "";
      }, true);
    }

    return {
      restrict: 'A',
      replace: true,
      require: '^ngModel',
      template: '<div id="map"></div>',
      scope: {
        ngModel: '=',
        ngLayers: '=',
        ngAction: '=',
        ngShown: '='
      },
      controller: ngLeafletController,
      link: ngLeafletLink
    };
  }
})();