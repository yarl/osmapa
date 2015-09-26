/* global angular, L */

(function () {
  'use strict';
  angular
          .module('osmapa.search')
          .factory('searchService', searchService);

  function searchService($q, $http) {
    var overpassCanceller = $q.defer();

    var uninterestingTags = ['source', 'source_ref', 'source:ref', 'history',
      'attribution', 'created_by', 'tiger:county', 'tiger:tlid', 'tiger:upload_uuid',
      'KSJ2:curve_id', 'KSJ2:lat', 'KSJ2:lon', 'KSJ2:coordinate', 'KSJ2:filename', 'note:ja'];

    var featureStyle = {
      color: "#FF6200",
      weight: 4,
      opacity: 1,
      fillOpacity: 0.5,
      clickable: false
    };



    var service = {
      searchNominatim: searchNominatim,
      search: search,
      overpass: overpass,
      stopOverpass: stopOverpass
    };
    return service;



    function searchNominatim(query) {
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
    }

    function search(query, coord) {
      var promise = $http({
        url: 'http://photon.komoot.de/api/?q=' + query + '&lat=' + coord.lat + '&lon=' + coord.lng,
        params: {'time': new Date().getTime()}
      }).then(function (response) {
        return response.data.features;
      });
      return promise;
    }

    function compareSize(feature1, feature2) {
      if (!feature1.bounds || !feature2.bounds) {
        return -1;
      }

      var width1 = feature1.bounds.maxlon - feature1.bounds.minlon,
              height1 = feature1.bounds.maxlat - feature1.bounds.minlat,
              area1 = width1 * height1,
              width2 = feature2.bounds.maxlat - feature2.bounds.minlat,
              height2 = feature2.bounds.maxlat - feature2.bounds.minlat,
              area2 = width2 * height2;

      return area1 - area2;
    }



    function featureGeometry(feature) {
      var geometry;

      if (feature.type === "node" && feature.lat && feature.lon) {
        geometry = L.circleMarker([feature.lat, feature.lon], featureStyle);
      } else if (feature.type === "way" && feature.geometry) {
        geometry = L.polyline(feature.geometry.filter(function (point) {
          return point !== null;
        }).map(function (point) {
          return [point.lat, point.lon];
        }), featureStyle);
      } else if (feature.type === "relation" && feature.members) {
        geometry = L.featureGroup(feature.members.map(featureGeometry).filter(function (geometry) {
          return geometry !== undefined;
        }));
      }

      return geometry;
    }

    function interestingFeature(feature) {
      if (feature.tags) {
        for (var key in feature.tags) {
          if (uninterestingTags.indexOf(key) < 0) {
            return true;
          }
        }
      }
      return false;
    }

    function overpass(coord, bounds, zoom) {
      // http://bit.ly/1LtYZsf

      var bbox = bounds.getSouth() + "," + bounds.getWest() + "," + bounds.getNorth() + "," + bounds.getEast(),
              radius = 10 * Math.pow(1.5, 19 - zoom),
              around = "around:" + radius + "," + coord.lat + "," + coord.lng,
              nodes = "node(" + around + ")",
              ways = "way(" + around + ")",
              relations = "relation(" + around + ")",
              nearby = "(" + nodes + ";" + ways + ");out tags geom;" + relations + ";out geom;",
              isin = "is_in(" + coord.lat + "," + coord.lng + ")->.a;way(pivot.a);out tags geom(" + bbox + ");relation(pivot.a);out tags bb;";

      //reset
      stopOverpass();
      overpassCanceller = $q.defer();

      var requests = {
        isin: $http({
          method: "POST",
          url: "//overpass-api.de/api/interpreter",
          data: "[timeout:5][out:json];" + isin,
          timeout: overpassCanceller.promise
        }),
        nearby: $http({
          method: "POST",
          url: "//overpass-api.de/api/interpreter",
          data: "[timeout:5][out:json];" + nearby,
          timeout: overpassCanceller.promise
        })
      };

      return $q.all(requests).then(function (data) {
        var response = [];
        var results = {
          isin: data.isin.statusText === "OK" ? data.isin.data.elements : [],
          nearby: data.nearby.statusText === "OK" ? data.nearby.data.elements : []
        };
        var unique = [];

        // filter empty objects
        for (var i in results) {
          results[i] = results[i].filter(function (element) {
            return interestingFeature(element);
          });
        }

        // add results
        results.nearby.forEach(function (element) {
          response.push(element);
          unique.push(element.id);
        });

        results.isin = results.isin.sort(compareSize);
        results.isin.forEach(function (element) {
          if (unique.indexOf(element.id) < 0) {
            if (element.tags.boundary === "administrative" ||
                    element.tags.region_category === "physiographic" ||
                    element.tags.type === "land_area" ||
                    element.tags.type === "route") {
            } else {
              response.push(element);
              unique.push(element.id);
            }
          }
        });

        return response;
      });
    }

    function stopOverpass() {
      overpassCanceller.resolve("cancelled");
    }
  }
})();