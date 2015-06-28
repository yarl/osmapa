(function () {
  'use strict';
  angular
          .module('osmapa.sidebar', ['ngMaterial'])
          .controller('SidebarController', SidebarController);

  function SidebarController($scope) {
    var sidebar = this;
    var main = $scope.main;

    sidebar.goToUrl = goToUrl;
    sidebar.websites = ["OpenStreetMap", "Google Maps"];

    function goToUrl(name) {
      switch (name) {
        case "Google Maps":
          return "https://www.google.com/maps/@" + main.map.lat + "," + main.map.lng + "," + main.map.zoom + "z";
        case "OpenStreetMap":
          return "http://www.openstreetmap.org/#map=" + main.map.zoom + "/" + main.map.lat + "/" + main.map.lng;
      }
    }



  }
})();