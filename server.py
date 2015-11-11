#!/usr/bin/env python
import logging
import os.path
import tornado.ioloop
import tornado.web
import tornado.websocket
import tornado.auth
import tornado.gen
import tornado.escape as esc

from tornado.options import define, options, parse_command_line

app_root = os.path.join(os.path.dirname(__file__), 'app')
app_url = '/app/index.html'

define('port', default=8888, help='run on the given port', type=int)

class SingleState:
    _shared_state = {}
    def __init__(self):
        self.__dict__ = self._shared_state

class EventHandler:
    _sender = None
    _event_domain = None

    def set_sender(self, sender):
        self._sender = sender

    def set_event_domain(self, event_domain):
        self._event_domain = event_domain

    def send_event(self, event_name, data, user = None):
        #if self._event_domain:
            #event_name = self._event_domain + ':' + event_name
        if self._sender:
            return self._sender.send_event(event_name, data, user = user)

    def on_event(self, event, data, socket_handler):
        event_method = 'on_' + event
        if hasattr(self, event_method):
            handler = getattr(self, event_method)
            if callable(handler):
                handler(data, socket_handler)

class SocketApplication(SingleState):
    _handlers = {}

    def __init__(self, **handlers):
        self._handlers = handlers

    @staticmethod
    def parse_event(data):
        event_domain = ''
        event = data.get('_event', '')
        if event:
            del data['_event']
            colon_index = event.find(':')
            if colon_index != -1:
                event_domain = event[:colon_index]
                event = event[colon_index + 1:]
        return (event_domain, event)

    def on_socket_message(self, data, socket_handler):
        (event_domain, event) = self.parse_event(data)
        handler = self._handlers.get(event_domain)
        if handler:
            handler.on_event(event, data, socket_handler)

    def call_hook(self, hook_name, socket_handler):
        hook_method = hook_name + '_hook'
        for key, handler in self._handlers.items():
            if hasattr(handler, hook_method):
                getattr(handler, hook_method)(socket_handler)

class AuthApplication(SocketApplication, EventHandler):
    _users = dict()

    def __init__(self, **handlers):
        for event_domain, handler in handlers.items():
            handler.set_sender(self)
            handler.set_event_domain(event_domain)
        handlers[''] = self
        super().__init__(**handlers)

    def on_login(self, data, connection):
        name = data.get('name')
        if not name or name in self._users:
            connection.send_event('login', {'success': False})
            return
        self._users[name] = connection
        connection.set_user(name)
        connection.send_event('login', {'success': True, 'name': name})
        self.call_hook('on_login', connection)
        self.participants()

    def logout(self, name):
        del self._users[name]
        self.participants()

    def participants(self):
        users = list(self._users.keys())
        self.send_event('participants', {'users': users})

    def send_event(self, event_name, data, user = None):
        if user:
            if user in self._users:
                self._users[name].send_event(event_name, data)
            else:
                return False
        else:
            for name, connection in self._users.items():
                connection.send_event(event_name, data)
        return True

class ChatService(SingleState, EventHandler):
    _messageBuffer = list()

    def on_login_hook(self, connection):
        connection.send_event('chat:messages', {'messages': self._messageBuffer})

    def on_message(self, data, connection):
        if not data.get('message'):
            return False
        data['name'] = connection._user
        self._messageBuffer.append(data.copy())
        self.send_event('chat:message', data)

    def on_private(self, data, connection):
        if not data.get('message'):
            return False
        data['from'] = connection._user
        recipient = data.get('to')
        if self.send_event('chat:private', data, user = recipient):
            connection.send_event('chat:private', data)

app = AuthApplication(chat = ChatService())

class TornadoApplication(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r'/', MainHandler),
            (r'/ws', WebSocketHandler),
            (r'/app/(.*)', tornado.web.StaticFileHandler, {'path': app_root}),
        ]
        settings = dict(
            debug=True,
        )
        tornado.web.Application.__init__(self, handlers, **settings)

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.redirect(app_url)

class WebSocketHandler(tornado.websocket.WebSocketHandler):
    _user = None

    def set_user(self, name):
        self._user = name

    def on_close(self):
        if self._user:
            app.logout(self._user)

    def on_message(self, msg):
        data = tornado.escape.json_decode(msg)
        app.on_socket_message(data, self)

    def send_event(self, event_name, data):
        data['_event'] = event_name
        self.write_message(esc.json_encode(data))


def main():
    parse_command_line()
    tornado_app = TornadoApplication()
    tornado_app.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()


if __name__ == '__main__':
    main()