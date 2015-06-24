angular.module('osmapa.search', ['ngMaterial']).controller('SearchController', [
  '$scope', 'searchService',
  function ($scope, searchService) {

    var _parent = $scope.$parent;
    $scope.search = "";

    $scope.querySearch = function (query) {
      var promise;
      promise = searchService.search(query, {
        lat: $scope.map.lat,
        lng: $scope.map.lng
      }).then(function (response) {
        return response;
      });
      return promise;
    };

    $scope.getName = function (item) {
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

    $scope.getAddress = function (item) {
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

      for (var i = 0, max = result.length; i < max; i++) {
        if(angular.isUndefined(result[i])) {
          result.splice(i, 1);
        }
      }

      return result.join(", ");
    };

    $scope.searchTextChange = function (text) {
      //$log.info('Text changed to ' + text);
    };

    $scope.selectedItemChange = function (item) {
      if (item) {

        if (item.properties.extent) {
          var bbox = item.properties.extent;
          _parent.action = [[bbox[1], bbox[0]], [bbox[3], bbox[2]]];
        } else {
          _parent.map.lat = item.geometry.coordinates[1];
          _parent.map.lng = item.geometry.coordinates[0];
          _parent.map.zoom = 18;
        }
      }
    };
  }]); 