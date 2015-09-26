/* global angular */

(function () {
  'use strict';
  angular
          .module('osmapa.infobox')
          .factory('infoboxService', infoboxService);

  function infoboxService($http, $timeout, model, searchService, mapService) {
    var service = {
      getElementGeometry: getElementGeometry,
      getMapillary: getMapillary,
      getWikiText: getWikiText,
      hide: hide,
      setLoadingState: setLoadingState,
      show: show
    };
    return service;

    ////////////

    function getElementGeometry(type, id) {
      var url = "//overpass-api.de/api/interpreter?data=[out:json];" + type + "(" + id + ");out geom;";
      var promise = $http.get(url).then(function (response) {
        return response.data.elements[0];
      });
      return promise;
    }

    function getWikiText(prefix, page) {
      return $http.jsonp('http://' + (prefix || 'en') + '.wikipedia.org/w/api.php?' +
              'action=query&prop=extracts&format=json&callback=JSON_CALLBACK&exintro=&titles=' + page);
    }

    function getMapillary(coord) {
      var key = "RXN4SEhnYXhMYkxlcDdqeDhJSnpXdzpiNjFmMDY1N2NlMDdkOTAw";
      var url = "https://a.mapillary.com/v2/search/im/close?client_id=" + key + "&limit=1&lat=" + coord.lat + "&lon=" + coord.lng + "&distance=50";
      $http.get(url).then(function (response) {
        if(response.data.ims.length) {
          model.show.mapillary = response.data.ims[0].key;
        }
      });
    }

    function hide() {
      searchService.stopOverpass();
      model.show.infobox = false;
      mapService.action = {
        type: "DRAW_OBJECT",
        clean: true
      };
      $timeout(function () {
        model.map.objects = [];
        model.map.objectsIndex = 0;
        model.show.mapillary = false;
      }, 500);
    }

    function setLoadingState(state) {
      model.show.infoboxLoading = state || false;
    }

    function show() {
      model.show.infobox = show;
    }
  }
})();