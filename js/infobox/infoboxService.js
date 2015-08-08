/* global angular */

(function () {
  'use strict';
  angular
          .module('osmapa.infobox')
          .service('infoboxService', infoboxService);

  function infoboxService($q, $http) {
    return {
      getWikiText: function (prefix, page) {
        return $http.jsonp('http://' + (prefix || 'en') + '.wikipedia.org/w/api.php?' + 
                'action=query&prop=extracts&format=json&callback=JSON_CALLBACK&exintro=&titles=' + page);
      }
    };
  }
})();