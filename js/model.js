/* global L, angular */

(function () {
  'use strict';
  angular
          .module('osmapa')
          .service('model', mapService);

  function mapService() {
    this.action = [];

    this.show = {
      search: true,
      infobox: false,
      infoboxLoading: false
    };

    this.map = {
      lat: 50.8545,
      lng: 19.2439,
      zoom: 10,
      layer: 'os',
      overlay: [],
      objects: []
    };

    this.layers = [{
        name: 'Osmapa Topo',
        shortcut: 'os',
        url: 'http://{s}.tile.openstreetmap.pl/osmapa.pl/{z}/{x}/{y}.png',
        attribution: ''
      }, {
        name: 'Mapnik',
        shortcut: 'ma',
        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: ''
      }, {
        name: 'Hike&Bike',
        shortcut: 'hb',
        url: 'http://{s}.tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png',
        attribution: 'Hike&Bike'
      }, {
        name: 'Public transport',
        shortcut: 'pt',
        url: 'http://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png',
        attribution: 'Tiles courtesy of Andy Allan'
      }, {
        name: 'Humanitarian',
        shortcut: 'hu',
        url: 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        attribution: 'Tiles courtesy of Humanitarian OpenStreetMap Team'
      }, {
        name: 'OpenTopo',
        shortcut: 'ot',
        url: 'http://server.opentopomap.org/{z}/{x}/{y}.png',
        attribution: 'OpenTopoMap'
      }];

    this.overlays = {
      sh: {
        name: 'Shading',
        shortcut: 'sh',
        url: 'http://tiles2.openpistemap.org/landshaded/{z}/{x}/{y}.png',
        attribution: 'Shading',
        zIndex: 2
      }, tr: {
        name: 'Transport',
        shortcut: 'tr',
        url: 'http://pt.openmap.lt/{z}/{x}/{y}.png',
        attribution: 'Transport',
        zIndex: 3
      }
    };
  }
})();
