/* global L */

(function () {
  'use strict';
  angular
          .module('osmapa.main', ['ngAnimate', 'ngMaterial'])
          .controller('MainController', MainController);

  function MainController($scope, $mdSidenav, $mdBottomSheet, $timeout, $http) {
    var main = this;

    main.action = [];
    main.map = {};
    main.layers = [];
    main.overlays = [];
    main.show = {};
    main.showLayerSwitcher = showLayerSwitcher;
    main.showMenu = showMenu;

    ////////////

    main.show = {
      search: true,
      infobox: false,
      infoboxLoading: false
    };

    main.map = {
      lat: 50.8545,
      lng: 19.2439,
      zoom: 10,
      layer: 'os',
      overlay: [],
      objects: [],
      shownObjects: new L.FeatureGroup()
    };

    main.layers = [{
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
   
     main.overlays = [{
        name: 'Shading',
        shortcut: 'sh',
        url: 'http://tiles{s}.openpistemap.org/landshaded/{z}/{x}/{y}.png',
        attribution: 'Shading'
      }, {
        name: 'Transport',
        shortcut: 'tr',
        url: 'http://pt.openmap.lt/{z}/{x}/{y}.png',
        attribution: 'Transport'
      }];

    ////////////

    function showMenu() {
      $mdSidenav('left').toggle();
    }

    function showLayerSwitcher($event) {
      $mdBottomSheet.show({
        templateUrl: 'js/layers/layers.tpl.html',
        controller: 'LayersController',
        locals: {
          layers: main.layers,
          map: main.map,
          overlays: main.overlays
        },
        targetEvent: $event,
        preserveScope: true
      }).then(function (selectedLayer) {
        $scope.setLayer(selectedLayer);
      });
    }
  }
})();
