(function () {
  'use strict';
  angular
          .module('osmapa.main', ['ngMaterial'])
          .controller('MainController', MainController);

  function MainController($scope, $mdSidenav, $mdBottomSheet) {
    var main = this;
    
    main.action = [];
    main.map = {};
    main.layers = [];
    main.show = {};
    main.showLayerSwitcher = showLayerSwitcher;
    main.showMenu = showMenu;
    
    ////////////
    
    main.show = {
      search: false
    };

    main.map = {
      lat: 50.8545,
      lng: 19.2439,
      zoom: 10,
      layer: 'os',
      overlay: [],
      objects: []
    };
    
    $scope.$watch('main.map.objects', function (_new){
      if(_new.lenght) {
        main.selectedIndex = 0;
      }
    });

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
      }];

    ////////////

    function showMenu() {
      $mdSidenav('left').toggle();
    };

    function showLayerSwitcher($event) {
      $mdBottomSheet.show({
        templateUrl: 'js/layers/layers.tpl.html',
        controller: 'LayersController',
        locals: {
          layers: main.layers,
          map: main.map
        },
        targetEvent: $event,
        preserveScope: true
      }).then(function (selectedLayer) {
        $scope.setLayer(selectedLayer);
      });
    };
  }
})();
