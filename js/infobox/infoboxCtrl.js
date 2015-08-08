/* global angular */

(function () {
  'use strict';
  angular
          .module('osmapa.infobox', ['ngAnimate', 'ngMaterial'])
          .controller('InfoboxController', InfoboxController);

  function InfoboxController($scope, infoboxService) {
    var infobox = this;
    var main = $scope.main;

    infobox.changeObjectsIndex = changeObjectsIndex;
    infobox.getObject = getObject;
    infobox.getObjectTag = getObjectTag;
    infobox.getObjectType = getObjectType;
    infobox.getWikiText = getWikiText;
    infobox.hide = hide;

    $scope.$watch(function () {
      return main.map.objectsPosition;
    }, function () {
      if (main.map.objects.length) {
        changeObjectsIndex(0);
      }
    }, true);

    function changeObjectsIndex(index) {
      main.map.objectsIndex = index;
      main.map.objectsTab = 0;
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

      return main.map.objects[number ? number : main.map.objectsIndex];
    }

    function getObjectTag(name, number) {
      return getObject(number).tags[name];
    }

    function getObjectType(number) {
      var tags = getObject(number).tags;
      var array = ["amenity", "shop", "highway", "tourism", "historic", "power",
        "building", "boundary", "leisure", "natural", "landuse", "waterway",
        "barrier", "addr:housenumber", "route"];
      var returned = "?";

      var getText = function (tagName) {
        var text = tagName + " / " + tags[tagName];
        return tags[tagName] ? text : false;
      };

      for (var i = 0, max = array.length; i < max; i++) {
        if(getText(array[i])) {
          returned = getText(array[i]);
          break;
        }
      }

      if(returned.indexOf("addr:housenumber") > -1) {
        returned = "address";
      }

      return returned;
    }

    function hide() {
      main.show.infobox = false;
      $timeout(function () {
        main.map.objects = [];
        main.map.objectsIndex = 0;
      }, 500);
    }


  }
})();