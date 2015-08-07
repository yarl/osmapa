(function () {
  'use strict';
  angular
      .module('osmapaApp', ['ngAnimate', 'ngMaterial', 'osmapa.main', 'osmapa.search', 'osmapa.sidebar'])
      .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
                .primaryPalette('green')
                .accentPalette('light-green');
      })
      .filter('domain', function() {
        return function (input) {
          var matches = input.match(/^https?\:\/\/(?:www\.)?([^\/?#]+)(?:[\/?#]|$)/i);
          return matches && matches[1];
        };
      });
})();