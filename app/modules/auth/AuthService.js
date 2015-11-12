define(['./module'], function (module) {
    'use strict';
    
    return module.factory('AuthService', function(PubSubService, WebSocket) {
        var service = {};
        var user;
        var users = [];

        var publisher = PubSubService.createPublisher();
        service.on = publisher.on;
        service.off = publisher.off;

        var setUser = function(value) {
            user = value;
            publisher.event('status_change', user);
        };

        WebSocket.subscribe({
            'participants': function(data) {
                users = data.users;
                return {
                    usersString: users.join(', '),
                    otherUsers: _.without(users, user)
                };
            }
        }, publisher);

        service.getUser = function() {
            return user;
        };

        service.getUsers = function() {
            return users.slice();
        };

        service.login = function(loginData, errorCallback) {
            WebSocket.connect(function() {
                setUser(false);
            });
            WebSocket.on('login', function(data) {
                if (data.success) {
                    setUser(data.name);
                } else {
                    errorCallback(data);
                }
                WebSocket.off('login');
            });
            WebSocket.sendEvent('login', loginData);
        };

        return service;
    });
});