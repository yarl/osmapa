/* global angular */

(function () {
  'use strict';
  angular
          .module('osmapa')
          .controller('LayersController', LayersController);
  
  function LayersController($scope, layers, map, overlays) {

    $scope.layers = layers;
    $scope.overlays = overlays;
    
    $scope.selectLayer = selectLayer;
    $scope.selectedOverlays = {};
    
    function selectLayer(layer) {
      for (var i in $scope.layers) {
        if (layer.name === $scope.layers[i].name) {
          map.layer = $scope.layers[i].shortcut;
          return true;
        }
      }
    };

    $scope.$watch('selectedOverlays', function() {
      var overlays = [];
      for(var i in $scope.selectedOverlays) {
        if($scope.selectedOverlays[i]) {
          overlays.push(i);
        }
      }
      map.overlay = overlays;
    }, true);
  }
})();