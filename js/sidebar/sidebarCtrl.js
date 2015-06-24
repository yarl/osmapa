angular.module('osmapa.sidebar', ['ngMaterial']).controller('SidebarController', [
  '$scope',
  function ($scope) {
    $scope.settings = [
      {name: 'Bluetooth', extraScreen: 'Bluetooth menu', icon: 'bluetooth', enabled: false},
      {name: 'Network', extraScreen: 'Wi-fi menu', icon: 'network_cell', enabled: true}
    ];
  }]);