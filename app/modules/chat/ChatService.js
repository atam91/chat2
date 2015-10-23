define(['./module'], function(module) {
    'use strict';

    return module.factory('ChatService', function(PubSubService, WebSocket, AuthService) {
        var service = {};
        var users = [];
        var messages = [];

        var publisher = PubSubService.createPublisher();
        service.on = publisher.on;
        service.off = publisher.off;

        var addMessage = function(data) {
            var message = {
                name: data.name,
                text: data.message,
                private: data.private || ''
            };
            messages.unshift(message);
            return message;
        };

        WebSocket.subscribe({
            '~message': function(data) {
                return addMessage(data);
            },
            '~participants': function(data) {
                users = data.users;
            },
            '~private': function(data) {
                data.name = data.from + ' > ' + data.to;
                if (data.to == AuthService.getUser()) {
                    data.private = data.from;
                } else {
                    data.private = data.to;
                }
                return addMessage(data);
            }
        }, publisher);

        service.getUsers = function() {
            return users.slice();
        };

        service.getMessages = function() {
            return messages.slice();
        };

        //отправка сообщения
        service.message = function(message) {
            WebSocket.send('message', {'message': message});
        };

        //отправка личного сообщения
        service.private = function(user, message) {
            WebSocket.send('private', {'to': user, 'message': message});
        };

        return service;
    });
});