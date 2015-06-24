angular.module('osmapaApp', ['ngMaterial', 'osmapa.map', 'osmapa.search', 'osmapa.sidebar'])
        .config(function ($mdThemingProvider) {
          $mdThemingProvider.theme('default')
                  .primaryPalette('green')
                  .accentPalette('light-green');
        });