/* global angular */

(function () {
  'use strict';
  angular
          .module('osmapa.infobox')
          .factory('infoboxService', infoboxService);

  function infoboxService($http, $timeout, model, searchService, mapService) {
    var service = {
      getElementGeometry: getElementGeometry,
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