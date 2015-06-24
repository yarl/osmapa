angular.module('osmapa.map').controller('LayersController', [
  '$scope', 'layers', 'mmap',
  function ($scope, layers, mmap) {

    $scope.layers = layers;
    $scope.selectLayer = function (layer) {
      for (var i in $scope.layers) {
        if (layer.name === $scope.layers[i].name) {
          mmap.layer = $scope.layers[i].shortcut;
          return true;
        }
      }
      
      //$mdBottomSheet.hide(layer);
    };
  }]);