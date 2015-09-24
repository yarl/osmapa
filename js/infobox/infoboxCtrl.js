/* global angular */

(function () {
  'use strict';
  angular
          .module('osmapa.infobox', ['ngAnimate', 'ngMaterial'])
          .directive('osmapaInfobox', function () {
            return {
              scope: {},
              templateUrl: 'js/infobox/infobox.tpl.html',
              replace: true,
              controller: 'InfoboxController',
              controllerAs: 'ctrl',
              bindToController: true
            };
          })
          .controller('InfoboxController', InfoboxController);

  function InfoboxController(model, $scope, $timeout, infoboxService, searchService) {
    var ctrl = this;

    ctrl.setMapCenter = setMapCenter;
    ctrl.setObject = setObject;
    ctrl.stop = stop;
    ctrl.getObject = getObject;
    ctrl.getObjects = getObjects;
    ctrl.getObjectTag = getObjectTag;
    ctrl.getObjectType = getObjectType;
    ctrl.getWikiText = getWikiText;
    ctrl.hide = hide;
    
    ctrl.isShown = function () {
      return model.show.infobox;
    };
    ctrl.isLoading = function () {
      return model.show.infoboxLoading;
    };

    $scope.$watch(function () {
      return model.map.objectsPosition;
    }, function () {
      if (model.map.objects.length) {
        setObject(0);
      }
    }, true);

    function drawObject(object) {
      if (object.type === "node") {
        model.action = new L.CircleMarker([object.lat, object.lon]);
      }
      else if (object.type === "way") {
        var latlngs = object.geometry.map(function (element) {
          return element ? [element.lat, element.lon] : [];
        });
        var isClosed = latlngs[0][0] === latlngs[latlngs.length - 1][0] &&
                latlngs[0][1] === latlngs[latlngs.length - 1][1];

        model.action = isClosed ? new L.Polygon(latlngs) : new L.Polyline(latlngs);
      }
      else if (object.type === "relation") {
        model.action = {};
      }
    }

    function setMapCenter(number) {
      var obj = getObject(number);

      if (obj.lat && obj.lon) {
        model.map.lat = obj.lat;
        model.map.lng = obj.lon;
        model.map.zoom = 18;
        return;
      }

      if (obj.bounds) {
        model.action = [
          [obj.bounds.minlat, obj.bounds.minlon],
          [obj.bounds.maxlat, obj.bounds.maxlon]
        ];
      }
    }

    function setObject(index) {
      model.map.objectsIndex = index;
      ctrl.activeTab = 0;
      drawObject(model.map.objects[index]);
      getWikiText(getObject());
    }

    function getWikiText(item) {
      if (!item.tags || !item.tags.wikipedia) {
        return false;
      }

      var wikipage = item.tags.wikipedia,
              prefix = "en", page = wikipage;

      if (/[a-z][a-z]:/i.test(wikipage.substring(0, 3))) {
        prefix = wikipage.substring(0, 2);
        page = wikipage.substring(3);
      }

      infoboxService.getWikiText(prefix, page).
              success(function (data) {
                for (var i in data.query.pages) {
                  if (i == "-1") {
                    item.wikipedia = "<strong>Error</strong>: Wikipedia page not found.";
                    return false;
                  }

                  var extract = data.query.pages[i].extract;

                  if (extract.length === 0) {
                    item.wikipedia = "<strong>Error</strong>: Wikipedia page is probably a redirect";
                    return false;
                  }

                  item.wikipedia = extract.length > 500 ? extract.substring(0, 500) + "..." : extract;
                  return true;
                }
              }).
              error(function (data, status, headers, config) {
                item.wikipedia = "Error occured, see log for details.";
              });
    }

    function getObject(number) {
      if (!model.map || !model.map.objects.length) {
        return {
          tags: {}
        };
      }

      return model.map.objects[angular.isNumber(number) ? number : model.map.objectsIndex];
    }

    function getObjects() {
      return model.map.objects;
    }

    function getObjectTag(name, number) {
      return getObject(number).tags[name];
    }

    function getObjectType(number) {
      var tags = getObject(number).tags;
      var array = ["amenity", "shop", "highway", "railway", "tourism", "historic", "power",
        "building", "boundary", "leisure", "natural", "landuse", "waterway",
        "place", "barrier", "addr:housenumber", "route"];
      var returned = "?";

      var getText = function (tagName) {
        var text = tagName + " / " + tags[tagName];
        return tags[tagName] ? text : false;
      };

      for (var i = 0, max = array.length; i < max; i++) {
        if (getText(array[i])) {
          returned = getText(array[i]);
          break;
        }
      }

      if (returned.indexOf("addr:housenumber") > -1) {
        returned = "address";
      }

      return returned;
    }

    function hide() {
      searchService.stopOverpass();
      model.show.infobox = false;
      $timeout(function () {
        model.map.objects = [];
        model.map.objectsIndex = 0;
      }, 500);
    }

    function stop() {
      searchService.stopOverpass();
      hide();
    }
  }
})();