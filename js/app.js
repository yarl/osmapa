angular.module('osmapaApp', ['ngMaterial', 'osmapa.map', 'osmapa.search', 'osmapa.sidebar'])
        .config(function ($mdThemingProvider, $mdIconProvider) {
          $mdIconProvider
                  .defaultIconSet("img/icons/avatars.svg", 128);

          $mdThemingProvider.theme('default')
                  .primaryPalette('green')
                  .accentPalette('light-green');

          $mdIconProvider
                  .iconSet('action', 'img/iconsets/action-icons.svg', 24)
                  .iconSet('alert', 'img/iconsets/alert-icons.svg', 24)
                  .iconSet('av', 'img/iconsets/av-icons.svg', 24)
                  .iconSet('communication', 'img/iconsets/communication-icons.svg', 24)
                  .iconSet('content', 'img/iconsets/content-icons.svg', 24)
                  .iconSet('device', 'img/iconsets/device-icons.svg', 24)
                  .iconSet('editor', 'img/iconsets/editor-icons.svg', 24)
                  .iconSet('file', 'img/iconsets/file-icons.svg', 24)
                  .iconSet('hardware', 'img/iconsets/hardware-icons.svg', 24)
                  .iconSet('icons', 'img/iconsets/icons-icons.svg', 24)
                  .iconSet('image', 'img/iconsets/image-icons.svg', 24)
                  .iconSet('maps', 'img/iconsets/maps-icons.svg', 24)
                  .iconSet('navigation', 'img/iconsets/navigation-icons.svg', 24)
                  .iconSet('notification', 'img/iconsets/notification-icons.svg', 24)
                  .iconSet('social', 'img/iconsets/social-icons.svg', 24)
                  .iconSet('toggle', 'img/iconsets/toggle-icons.svg', 24);
        });