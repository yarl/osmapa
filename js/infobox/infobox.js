/* global angular, L */

(function () {
  'use strict';
  angular
          .module('osmapa.infobox', ['ngAnimate', 'ngMaterial', 'osmapa.map'])
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

  function InfoboxController(model, $scope, $window, infoboxService, searchService, mapService) {
    var ctrl = this;

    ctrl.setMapCenter = setMapCenter;
    ctrl.setObject = setObject;
    ctrl.showMapillary = showMapillary;
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
    ctrl.isMapillary = function () {
      return model.show.mapillary ?
              "https://d1cuyjsrcm0gby.cloudfront.net/" + model.show.mapillary + "/thumb-320.jpg" :
              false;
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
        mapService.drawNode([object.lat, object.lon]);
      }
      else if (object.type === "way") {
        mapService.drawWay(object.geometry);
      }
      else if (object.type === "relation") {
        mapService.clean();
        infoboxService.getElementGeometry(object.type, object.id).then(function (data) {
          mapService.drawRelation(data.members);
        });
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
        mapService.zoomToBoundary(obj.bounds);
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
        "man_made", "building", "boundary", "leisure", "natural", "landuse", "waterway",
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

    function showMapillary() {
      if (model.show.mapillary) {
        $window.open("http://www.mapillary.com/map/im/" + model.show.mapillary + "/photo",
                model.show.mapillary);
      }
    }

    function hide() {
      infoboxService.hide();
    }

    function stop() {
      searchService.stopOverpass();
      hide();
    }
  }
})();