(function () {
  'use strict';
  angular
      .module('osmapaApp', ['ngMaterial', 'osmapa.main', 'osmapa.search', 'osmapa.sidebar'])
      .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
                .primaryPalette('green')
                .accentPalette('light-green');
      });
})();