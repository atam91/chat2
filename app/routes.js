define(['./app'], function(app) {
    'use strict';
    return app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/chat', {
            templateUrl: 'partials/chat.html'
        });
        $routeProvider.otherwise({redirectTo: '/chat'});
    }]);
});