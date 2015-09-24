/* global angular */

(function () {
  'use strict';
  angular
      .module('osmapa', ['ngAnimate', 'ngMaterial', 'ngSanitize',
              'osmapa.map', 'osmapa.search', 'osmapa.sidebar', 'osmapa.infobox'])
      .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
                .primaryPalette('green')
                .accentPalette('light-green');
      })
      .filter('domain', function() {
        return function (input) {
          if(!input) {
            return "";
          }
          
          var matches = input.match(/^https?\:\/\/(?:www\.)?([^\/?#]+)(?:[\/?#]|$)/i);
          return matches && matches[1];
        };
      })
      .filter('toStars', function() {
        return function (input) {
          function isNumeric(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
          }
          
          if(!isNumeric(input)) {
            return "";
          }
          
          var text = "";
          for(var i=0; i<input; i++) {
            text += "*";
          }
          
          return text;
        };
      });
})();