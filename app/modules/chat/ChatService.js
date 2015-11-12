define(['./module'], function(module) {
    'use strict';

    return module.factory('ChatService', function(PubSubService, WebSocket, AuthService) {
        var service = {};
        var messageBuffer = [];

        var publisher = PubSubService.createPublisher();
        service.on = publisher.on;
        service.off = publisher.off;

        var addMessage = function(data) {
            var message = {
                name: data.name,
                text: data.message,
                private: data.private || ''
            };
            messageBuffer.unshift(message);
            return message;
        };

        WebSocket.subscribe({
            'chat:message': function(data) {
                return addMessage(data);
            },
            'chat:messages': function(data) {
                _.each(data.messages, addMessage);
            },
            'chat:private': function(data) {
                data.name = data.from + ' > ' + data.to;
                if (data.to == AuthService.getUser()) {
                    data.private = data.from;
                } else {
                    data.private = data.to;
                }
                return addMessage(data);
            }
        }, publisher);

        service.getMessages = function() {
            return messageBuffer.slice();
        };

        //отправка сообщения
        service.sendMessage = function(message) {
            WebSocket.sendEvent('chat:message', {'message': message});
        };

        //отправка личного сообщения
        service.sendPrivate = function(user, message) {
            WebSocket.sendEvent('chat:private', {'to': user, 'message': message});
        };

        return service;
    });
});