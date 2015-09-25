/* global angular */

(function () {
  'use strict';
  angular
          .module('osmapa')
          .directive('osmapaToolbar', function () {
            return {
              scope: {},
              templateUrl: 'js/toolbar/toolbar.tpl.html',
              replace: true,
              controller: 'ToolbarController',
              controllerAs: 'ctrl',
              bindToController: true
            };
          })
          .controller('ToolbarController', ToolbarController);

  function ToolbarController(model, $scope, $mdSidenav, $mdBottomSheet) {
    var ctrl = this;

    ctrl.geolocate = geolocate;
    ctrl.showMenu = showMenu;
    ctrl.showLayerSwitcher = showLayerSwitcher;

    ////////////

    function geolocate() {
      model.action = {
        type: "GEOLOC"
      };
    }

    function showMenu() {
      $mdSidenav('left').toggle();
    }

    function showLayerSwitcher($event) {
      $mdBottomSheet.show({
        templateUrl: 'js/layers/layers.tpl.html',
        controller: 'LayersController',
        controllerAs: 'ctrl',
        targetEvent: $event,
        preserveScope: true
      }).then(function (selectedLayer) {
        $scope.setLayer(selectedLayer);
      });
    }
  }
})();