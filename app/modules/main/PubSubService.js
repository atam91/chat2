define(['./module'], function (module) {
    'use strict';

    return module.factory('PubSubService', function() {
        var service = {};

        service.createPublisher = function() {
            var publisher = {};
            var handlers = {};
            var subscribers = {};

            publisher.on = function(name, callback) {
                if (!(name in handlers)) {
                    handlers[name] = [];
                }
                handlers[name].push(callback);
            };

            publisher.off = function(name) {
                delete handlers[name];
            };

            publisher.event = function(name, data) {
                _.each(handlers[name], function(handler) {
                    handler(data);
                });
                _.each(subscribers[name], function(handler) {
                    handler(data);
                });
            };

            var subscribe = function(name, callback) {
                if (!(name in subscribers)) {
                    subscribers[name] = [];
                }
                subscribers[name].push(callback);
            };

            publisher.subscribe = function(events, subscriber) {
                _.each(events, function(handler, eventName) {
                    subscribe(eventName, function(data) {
                        var res = typeof(handler) === 'function' && handler(data);
                        if (res) {
                            data = res;
                        }
                        subscriber.event(eventName, data);
                    });
                });
            };

            return publisher;
        };

        return service;
    });
});