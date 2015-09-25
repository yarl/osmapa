/* global angular */

(function () {
  'use strict';
  angular
          .module('osmapa')
          .controller('LayersController', LayersController);

  function LayersController($scope, model) {
    var ctrl = this;

    ctrl.layers = model.layers;
    ctrl.overlays = model.overlays;
    
    ctrl.selectedOverlays = {};
    model.map.overlay.forEach(function(element) {
      ctrl.selectedOverlays[element] = true;
    });

    ctrl.selectLayer = selectLayer;
    ctrl.selectOverlay = selectOverlay;

    ////////////

    function selectLayer(layer) {
      for (var i in model.layers) {
        if (layer.name === model.layers[i].name) {
          model.map.layer = model.layers[i].shortcut;
          return true;
        }
      }
    }

    function selectOverlay() {
      var overlays = [];
      for (var i in ctrl.selectedOverlays) {
        if (ctrl.selectedOverlays[i]) {
          overlays.push(i);
        }
      }
      model.map.overlay = overlays;
    }
  }
})();