/* global angular */

(function () {
  'use strict';
  angular
          .module('osmapa.search', ['ngAnimate', 'ngMaterial'])
          .controller('SearchController', SearchController);

  function SearchController($scope, searchService) {
    var search = this;
    var main = $scope.main;
    
    search.getAddress = getAddress;
    search.getName = getName;
    search.querySearch = querySearch;
    search.search = "";
    search.selectedItemChange = selectedItemChange;
    
    ////////////
    
    function getAddress(item) {
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

      result = result.filter(function(current) {
          return current !== undefined;
      });

      return result.join(", ");
    };
    
    function getName(item) {
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
    }
    
    function querySearch(query) {
      var promise;
      promise = searchService.search(query, {
        lat: main.map.lat,
        lng: main.map.lng
      }).then(function (response) {
        return response;
      });
      return promise;
    };
    
    function selectedItemChange(item) {
      if (item) {
        if (item.properties.extent) {
          var bbox = item.properties.extent;
          main.action = [[bbox[1], bbox[0]], [bbox[3], bbox[2]]];
        } else {
          main.map.lat = item.geometry.coordinates[1];
          main.map.lng = item.geometry.coordinates[0];
          main.map.zoom = 18;
        }
      }
    };
  }
})();