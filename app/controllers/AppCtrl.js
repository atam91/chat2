define(['./controllers'], function(controllers) {
    controllers.controller('AppCtrl', function($scope, AuthService, $timeout) {
        $scope.user = AuthService.getUser();

        AuthService.on('status_change', function(user) {
            $scope.$apply(function() {
                $scope.user = user;
            });
        });
    });
});