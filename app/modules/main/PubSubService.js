define(['./module'], function (module) {
    'use strict';

    return module.factory('PubSubService', function() {
        var service = {};

        service.createPublisher = function() {
            var handlers = {};
            return {
                'on': function(name, callback) {
                    if (!(name in handlers)) {
                        handlers[name] = [];
                    }
                    handlers[name].push(callback);
                },
                'off': function(name) {
                    delete handlers[name];
                },
                'event': function(name, data) {
                    _.each(handlers[name], function(handler) {
                        handler(data);
                    });
                }
            };
        };

        return service;
    });
});