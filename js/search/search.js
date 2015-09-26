/* global angular */

(function () {
  'use strict';
  angular
          .module('osmapa.search', ['ngAnimate', 'ngMaterial', 'osmapa.infobox', 'osmapa.map'])
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

  function SearchController(model, searchService, infoboxService, mapService) {
    var ctrl = this;

    ctrl.querySearch = querySearch;
    ctrl.search = "";
    ctrl.selectedItemChange = selectedItemChange;

    ////////////

    function querySearch(query) {
      infoboxService.hide();
      var promise;
      promise = searchService.search(query, {
        lat: model.map.lat,
        lng: model.map.lng
      }).then(function (response) {
        return response;
      });
      return promise;
    }

    function selectedItemChange(item) {
      if (item) {
        if (item.properties.extent) {
          var bbox = item.properties.extent;
          mapService.zoomToBoundary({
            minlat: bbox[1], minlon: bbox[0],
            maxlat: bbox[3], maxlon: bbox[2]
          });

        } else {
          model.map.lat = item.geometry.coordinates[1];
          model.map.lng = item.geometry.coordinates[0];
          model.map.zoom = 18;
        }

        ctrl.searchText = "";
        
        infoboxService.show();
        infoboxService.setLoadingState(false);
        model.map.objects = [{
            id: item.properties.osm_id,
            lat: item.geometry.coordinates[1],
            lon: item.geometry.coordinates[0],
            tags: {
              name: item.properties.name
            },
            type: item.properties.osm_type
        }];
      }
    }
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