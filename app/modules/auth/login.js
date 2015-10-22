define(['./module'], function(module) {
    'use strict';

    return module.directive('login', function(AuthService) {
        return {
            restrict: 'E',
            templateUrl: 'modules/auth/loginTemplate.html',
            replace: true,
            link: function($scope, element, attrs) {
                $scope.login = function() {
                    AuthService.login({name: $scope.name}, function(data) {
                        $scope.$apply(function() {
                            $scope.error = 'Введённое имя недоступно.';
                            $scope.name = '';
                        });
                        
                    });
                };
                $scope.clearError = function() {
                    $scope.error = null;
                };
            }
        };
    });
});