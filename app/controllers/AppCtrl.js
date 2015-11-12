define(['./controllers'], function(controllers) {
    controllers.controller('AppCtrl', function($scope, AuthService) {
        $scope.user = '';
        $scope.usersString = '';
        $scope.otherUsers = [];

        AuthService.on('status_change', function(user) {
            $scope.$apply(function() {
                $scope.user = user;
            });
        });

        AuthService.on('participants', function(data) {
            $scope.$apply(function() {
                $scope.usersString = data.usersString;
                $scope.otherUsers = data.otherUsers;
            });
        });
    });
});