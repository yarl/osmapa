angular.module('osmapa.search').service('searchService', [
  '$q', '$http',
  function ($q, $http) {
    return {
      searchNominatim: function (query) {
        var promise = $http({
          url: 'http://nominatim.openstreetmap.org/search?q=' + query + '&format=json&addressdetails=1&polygon=0',
          params: {'time': new Date().getTime()}
        }).then(function (response) {
          response.data.forEach(function (element) {
            element.name = element.address[Object.keys(element.address)[0]];
            element.addr = element.display_name.substring(element.name.length + 2);
          });
          return response.data;
        });
        return promise;
      },
      search: function (query, coord) {
        var promise = $http({
          url: 'http://photon.komoot.de/api/?q=' + query + '&lat=' + coord.lat + '&lon=' + coord.lng,
          params: {'time': new Date().getTime()}
        }).then(function (response) {
          return response.data.features;
        });
        return promise;
      }
    };
  }
]);