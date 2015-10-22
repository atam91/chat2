define(['./module'], function (module) {
    'use strict';

    return module.factory('WebSocket', function(PubSubService) {
        var service = {};
        var ws;

        var publisher = PubSubService.createPublisher();
        service.on = publisher.on;
        service.off = publisher.off;

        service.connect = function(onclose) {
            if (ws && ws.readyState === ws.OPEN) return;
            //TODO $location
            ws = new WebSocket("ws://" + window.location.host + "/ws");

            var sendOrig = ws.send;
            var outgoingQueue = [];
            ws.send = function(message) {
                outgoingQueue.push(message);
            };

            ws.onopen = function() {
                var message;
                ws.send = sendOrig;
                while (message = outgoingQueue.shift()) {
                    ws.send(message);
                }
            };

            ws.onmessage = function(event) {
                var data = JSON.parse(event.data);
                //console.log('onmessage', data);
                var name = data._event || '';
                publisher.event(name, data);
            };

            ws.onclose = function() {
                typeof(onclose) === 'function' && onclose();
            }
        };

        service.send = function(name, data) {
            if (!ws) return false;
            data._event = name;
            ws.send(JSON.stringify(data));
            return true;
        };

        return service;
    });
});