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
    main.show = {};
    main.changeObjectsIndex = changeObjectsIndex;
    main.getObject = getObject;
    main.showLayerSwitcher = showLayerSwitcher;
    main.showMenu = showMenu;
    main.hideInfobox = hideInfobox;

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
      objects: []
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
      }];

    ////////////

    function hideInfobox() {
      main.show.infobox = false;
      $timeout(function () {
        main.map.objects = [];
        main.map.objectsIndex = 0;
      }, 500);
    }

    function showMenu() {
      $mdSidenav('left').toggle();
    }

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
    }

    /* objects */

    $scope.$watch(function () {
      return main.map.objects;
    }, function (newVal, oldVal) {
      if (newVal.length) {
        changeObjectsIndex(0);
      }
    }, true);

    function changeObjectsIndex(index) {
      main.map.objectsIndex = index;
      main.map.objectsTab = 0;
      getWikiText(getObject());
    }

    function getObject() {
      if (!main.map.objects.length) {
        return {};
      }

      return main.map.objects[main.map.objectsIndex];
    }

    function getWikiText(item) {
      if(!item.tags || !item.tags.wikipedia) {
        return false;
      }
      
      var wikipage = item.tags.wikipedia,
              prefix = "en", page = wikipage;

      if (/[a-z][a-z]:/i.test(wikipage.substring(0, 3))) {
        prefix = wikipage.substring(0, 2);
        page = wikipage.substring(3);
      }

      $http.jsonp('http://' + prefix + '.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&callback=JSON_CALLBACK&exintro=&titles=' + page).
              success(function (data) {
                for (var i in data.query.pages) {
                  if (i == "-1") {
                    item.wikipedia = "<strong>Error</strong>: Wikipedia page not found.";
                    return false;
                  }

                  var extract = data.query.pages[i].extract;

                  if (extract.length === 0) {
                    item.wikipedia = "<strong>Error</strong>: Wikipedia page is probably a redirect";
                    return false;
                  }

                  item.wikipedia = extract.length > 500 ? extract.substring(0, 500) + "..." : extract;
                  return true;
                }
              }).
              error(function (data, status, headers, config) {
                item.wikipedia = "Error occured, see log for details.";
              });
    }
  }
})();
