/* global angular */

(function () {
  'use strict';
  angular
          .module('osmapa.sidebar', ['ngAnimate', 'ngMaterial'])
          .directive('osmapaSidebar', function () {
            return {
              scope: {},
              templateUrl: 'js/sidebar/sidebar.tpl.html',
              replace: true,
              controller: 'SidebarController',
              controllerAs: 'ctrl',
              bindToController: true
            };
          })
          .controller('SidebarController', SidebarController);

  function SidebarController(model) {
    var ctrl = this;

    ctrl.goToUrl = goToUrl;
    ctrl.websites = ["OpenStreetMap", "Google Maps"];

    function goToUrl(name) {
      switch (name) {
        case "Google Maps":
          return "https://www.google.com/maps/@" + model.map.lat + "," + model.map.lng + "," + model.map.zoom + "z";
        case "OpenStreetMap":
          return "http://www.openstreetmap.org/#map=" + model.map.zoom + "/" + model.map.lat + "/" + model.map.lng;
      }
    }
  }
})();