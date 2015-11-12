define(['./module'], function(module) {
    'use strict';

    return module.directive('selectFrom', function(AuthService) {
        return {
            restrict: 'A',
            templateUrl: 'modules/directives/selectFromTemplate.html',
            replace: true,
            scope: {
                selectFrom: '=',
                emptyValue: '@',
                value: '='
            },
            link: function($scope, element, attrs) {
                $scope.$watch("selectFrom", function(options) {
                    if ($scope.value && options.indexOf($scope.value) == -1) {
                        $scope.value = "";
                    }
                })
            }
        };
    });
});