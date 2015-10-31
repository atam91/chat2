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

class Singleton(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(Singleton, cls).__call__(*args, **kwargs)
        return cls._instances[cls]

class ChatApp(metaclass=Singleton):
    _users = dict()
    _messageBuffer = list()

    def event(self, eventName, data):
        for name, connect in self._users.items():
            connect.event(eventName, data)

    def login(self, data, connection):
        name = data.get('name')
        if not name or name in self._users:
            connection.event('~login', {'success': False})
            return
        self._users[name] = connection
        connection.set_user(name)
        connection.event('~login', {'success': True, 'name': name})
        connection.event('~messages', {'messages': self._messageBuffer})
        self.participants()

    def logout(self, name):
        logging.info("logout %r", name)
        del self._users[name]
        self.participants()

    def message(self, data, connection):
        if not data.get('message'):
            return False
        data['name'] = connection._user
        self._messageBuffer.append(data.copy())
        self.event('~message', data)

    def private(self, data, connection):
        if not data.get('message'):
            return False
        name = data.get('to')
        if name in self._users:
            data['from'] = connection._user
            self._users[name].event('~private', data)
            connection.event('~private', data)

    def participants(self):
        users = list(self._users.keys())
        self.event('~participants', {'users': users})


chat = ChatApp()

class Application(tornado.web.Application):
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
    def open(self):
        self._user = False

    def set_user(self, name):
        self._user = name

    def on_close(self):
        if self._user:
            chat.logout(self._user)

    def on_message(self, msg):
        data = tornado.escape.json_decode(msg)
        event = data.get('_event')
        if event:
            if hasattr(chat, event):
                handler = getattr(chat, event)
                if callable(handler):
                    del data['_event']
                    handler(data, self)

    def event(self, eventName, data):
        data['_event'] = eventName
        self.write_message(esc.json_encode(data))


def main():
    parse_command_line()
    app = Application()
    app.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()


if __name__ == '__main__':
    main()