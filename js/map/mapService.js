/* global angular, L */

(function () {
  'use strict';
  angular
          .module('osmapa.map')
          .factory('mapService', mapService);

  function mapService() {

    var service = {
      action: {},
      clean: clean,
      drawNode: drawNode,
      drawWay: drawWay,
      drawRelation: drawRelation,
      geolocate: geolocate,
      zoomToBoundary: zoomToBoundary
    };
    return service;

    ////////////

    function clean() {
      service.action = {
        type: "DRAW_OBJECT",
        clean: true
      };
    }

    function drawNode(coord) {
      service.action = {
        type: "DRAW_OBJECT",
        data: new L.CircleMarker(coord), //@TODO: coord validation
        clean: true
      };
    }

    function drawWay(coords) {
      var latlngs = coords.map(function (element) {
        return element ? [element.lat, element.lon] : [0, 0];
      });
      var isClosed = latlngs[0][0] === latlngs[latlngs.length - 1][0] &&
              latlngs[0][1] === latlngs[latlngs.length - 1][1];

      service.action = {
        type: "DRAW_OBJECT",
        data: isClosed ? new L.Polygon(latlngs) : new L.Polyline(latlngs),
        clean: true
      };
    }

    function isClosedWay(geometry) {
      return geometry[0][0] === geometry[geometry.length - 1][0] &&
              geometry[0][1] === geometry[geometry.length - 1][1];
    }

    /* [{lat: 12.34, lon: 56.78}] --> [[12.34, 56.78]] */
    function coordinatesToArray(array) {
      var arr = [];
      array.forEach(function (element) {
        arr.push([element.lat, element.lon]);
      });
      return arr;
    }

    function drawRelation(elements) {
      var polygons = [];
      var polylines = [];

      elements.forEach(function (element) {
        var geometry = coordinatesToArray(element.geometry);
        var target = isClosedWay(geometry) ? polygons : polylines;

        element.role === "outer" ?
                target.unshift(geometry) :
                target.push(geometry);
      });

      service.action = {
        type: "DRAW_OBJECT",
        data: new L.MultiPolygon(polygons),
        clean: true
      };
      service.action = {
        type: "DRAW_OBJECT",
        data: new L.MultiPolyline(polylines)
      };
    }

    function geolocate() {
      service.action = {
        type: "GEOLOC"
      };
    }

    function zoomToBoundary(bounds) {
      service.action = {
        type: "ZOOM_TO_BOUNDARY",
        data: [
          [bounds.minlat, bounds.minlon],
          [bounds.maxlat, bounds.maxlon]
        ]
      };
    }

  }
})();