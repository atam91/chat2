define([
    'angular',
    'angular-route',
    'html5-boilerplate',
    //'fabric',
    'underscore',
    './modules/index'
], function (angular) {
    'use strict';

    return angular.module('app', [
        'services',
        'ngRoute'
    ]);
});