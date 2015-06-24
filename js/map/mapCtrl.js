angular.module('osmapa.map', ['ngMaterial']).controller('MapController', [
  '$scope', '$q', '$mdSidenav', '$mdBottomSheet', '$log', '$timeout',
  function ($scope, $q, $mdSidenav, $mdBottomSheet, $log, $timeout) {

    /* vars */

    $scope.show = {
      search: false
    };

    $scope.map = {
      lat: 50.8545,
      lng: 19.2439,
      zoom: 10,
      layer: 'os'
    };
    $scope.action = [];

    $scope.layers = [{
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
      }];

    /* right menu */

    $scope.toggleMenu = function () {
      $mdSidenav('left').toggle();
    };

    /* layers */

    $scope.showLayerChange = function ($event) {
      $mdBottomSheet.show({
        templateUrl: 'js/layers/layers.tpl.html',
        controller: 'LayersController',
        locals: {
          layers: $scope.layers,
          mmap: $scope.map
        },
        targetEvent: $event,
        preserveScope: true
      }).then(function (selectedLayer) {
        $scope.setLayer(selectedLayer);
      });
    };
  }
]);

