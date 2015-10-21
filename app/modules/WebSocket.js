define(['angular'], function (ng) {
    'use strict';
    
    return ng.module('services', []).factory('WebSocket', function() {
        var service = {};
        var handlers = {};
        var ws;

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
                if (handlers[name]) {
                    _.each(handlers[name], function(handler) {
                        handler(data);
                    });
                }
            };

            ws.onclose = function() {
                typeof(onclose) === 'function' && onclose();
            }
        };

        service.serverEvent = function(name, data) {
            if (!ws) return false;
            data._event = name;
            ws.send(JSON.stringify(data));
            return true;
        };

        service.on = function(name, callback) {
            if (typeof(callback) != "function") return false;
            if (!(name in handlers)) {
                handlers[name] = [];
            }
            handlers[name].push(callback);
        };

        service.off = function(name) {
            delete handlers[name];
        };

        return service;
    });
});