require.config({
    paths: {
        'angular': 'lib/angular/angular',
        'angular-route': 'lib/angular-route/angular-route',
        'html5-boilerplate': 'lib/html5-boilerplate/dist/js/vendor/modernizr-2.8.3.min',
        'underscore': 'lib/underscore/underscore',
        'domReady': 'lib/requirejs-domready/domReady'
    },
    shim: {
        'angular': {
            exports: 'angular'
        },
        'angular-route': {
            deps: ['angular']
        },
        'fabric': {
            exports: 'fabric'
        }
    },
    deps: ['./init']
});