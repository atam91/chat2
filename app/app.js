define([
    'angular',
    'angular-route',
    'html5-boilerplate',
    //'fabric',
    'underscore',
    './modules/index',
    './controllers/index'
], function (angular) {
    'use strict';

    return angular.module('app', [
        'ngRoute',
        'controllers',
        'directives',
        'main',
        'auth',
        'chat'
    ]);
});