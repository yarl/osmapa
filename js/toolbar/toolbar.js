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
    
    ctrl.showMenu = showMenu;
    ctrl.showLayerSwitcher = showLayerSwitcher;
    
    ////////////
   
    function showMenu() {
      $mdSidenav('left').toggle();
    }

    function showLayerSwitcher($event) {
      $mdBottomSheet.show({
        templateUrl: 'js/layers/layers.tpl.html',
        controller: 'LayersController',
        locals: {
          layers: model.layers,
          map: model.map,
          overlays: model.overlays
        },
        targetEvent: $event,
        preserveScope: true
      }).then(function (selectedLayer) {
        $scope.setLayer(selectedLayer);
      });
    }
  }
})();