/* global angular */

(function () {
  'use strict';
  angular
          .module('osmapa.search', ['ngAnimate', 'ngMaterial'])
          .directive('osmapaSearch', function () {
            return {
              scope: {},
              templateUrl: 'js/search/search.tpl.html',
              replace: true,
              controller: 'SearchController',
              controllerAs: 'ctrl',
              bindToController: true
            };
          })
          .controller('SearchController', SearchController)
          .filter('getAddress', GetAddressFilter)
          .filter('getName', GetNameFilter);

  function SearchController(model, searchService) {
    var ctrl = this;
    
    ctrl.querySearch = querySearch;
    ctrl.search = "";
    ctrl.selectedItemChange = selectedItemChange;
    
    ////////////
   
    function querySearch(query) {
      var promise;
      promise = searchService.search(query, {
        lat: model.map.lat,
        lng: model.map.lng
      }).then(function (response) {
        return response;
      });
      return promise;
    };
    
    function selectedItemChange(item) {
      if (item) {
        if (item.properties.extent) {
          var bbox = item.properties.extent;
          model.action = [[bbox[1], bbox[0]], [bbox[3], bbox[2]]];
        } else {
          model.map.lat = item.geometry.coordinates[1];
          model.map.lng = item.geometry.coordinates[0];
          model.map.zoom = 18;
        }
      }
    };
  }
  
  function GetAddressFilter() {
    return function (item) {
      var prop = item.properties;
      var result = [];

      if (prop.housenumber && prop.street) {
        result.push(prop.street + " " + prop.housenumber);
      } else if (prop.street) {
        result.push(prop.street);
      }

      result.push(prop.city);
      result.push(prop.state);
      result.push(prop.country);

      result = result.filter(function (current) {
        return current !== undefined;
      });

      return result.join(", ");
    };
  }
  
  function GetNameFilter() {
    return function (item) {
      var prop = item.properties;
      if (prop.name) {
        return prop.name;
      }
      if (prop.street) {
        return prop.street + " " + prop.housenumber;
      }
      if (prop.city) {
        return prop.city;
      }
      return "?";
    };
  }
})();