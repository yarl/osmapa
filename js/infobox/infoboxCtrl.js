/* global angular */

(function () {
  'use strict';
  angular
          .module('osmapa.infobox', ['ngAnimate', 'ngMaterial'])
          .controller('InfoboxController', InfoboxController);

  function InfoboxController($scope, $timeout, infoboxService, searchService) {
    var infobox = this;
    var main = $scope.main;

    infobox.setMapCenter = setMapCenter;
    infobox.setObject = setObject;
    infobox.stop = stop;
    infobox.getObject = getObject;
    infobox.getObjectTag = getObjectTag;
    infobox.getObjectType = getObjectType;
    infobox.getWikiText = getWikiText;
    infobox.hide = hide;

    $scope.$watch(function () {
      return main.map.objectsPosition;
    }, function () {
      if (main.map.objects.length) {
        setObject(0);
      }
    }, true);

    function drawObject(object) {
      if (object.type === "node") {
        main.action = new L.CircleMarker([object.lat, object.lon]);
      }
      else if (object.type === "way") {
        var latlngs = object.geometry.map(function (element) {
          return [element.lat, element.lon];
        });
        var isClosed = latlngs[0][0] === latlngs[latlngs.length - 1][0] &&
                latlngs[0][1] === latlngs[latlngs.length - 1][1];

        main.action = isClosed ? new L.Polygon(latlngs) : new L.Polyline(latlngs);
      }
      else if (object.type === "relation") {
        main.action = {};
      }
    }

    function setMapCenter(number) {
      var obj = getObject(number);

      if (obj.lat && obj.lon) {
        main.map.lat = obj.lat;
        main.map.lng = obj.lon;
        main.map.zoom = 18;
        return;
      }

      if (obj.bounds) {
        main.action = [
          [obj.bounds.minlat, obj.bounds.minlon],
          [obj.bounds.maxlat, obj.bounds.maxlon]
        ];
      }
    }

    function setObject(index) {
      main.map.objectsIndex = index;
      main.map.objectsTab = 0;
      drawObject(main.map.objects[index]);
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
      if (!main.map || !main.map.objects.length) {
        return {
          tags: {}
        };
      }

      return main.map.objects[angular.isNumber(number) ? number : main.map.objectsIndex];
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
      main.show.infobox = false;
      $timeout(function () {
        main.map.objects = [];
        main.map.objectsIndex = 0;
      }, 500);
    }

    function stop() {
      searchService.stopOverpass();
      hide();
    }
  }
})();