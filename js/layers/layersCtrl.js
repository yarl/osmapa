(function () {
  'use strict';
  angular
          .module('osmapa.main')
          .controller('LayersController', LayersController);
  
  function LayersController($scope, layers, map) {

    $scope.layers = layers;
    $scope.selectLayer = selectLayer;
    
    function selectLayer(layer) {
      for (var i in $scope.layers) {
        if (layer.name === $scope.layers[i].name) {
          map.layer = $scope.layers[i].shortcut;
          return true;
        }
      }
    };

    $scope.$watch('overlays', function() {
      var overlays = [];
      for(var i in $scope.overlays) {
        if($scope.overlays[i]) {
          overlays.push(i);
        }
      }
      map.overlay = overlays;
    }, true);
  }
})();