define(['./module'], function(module) {
    'use strict';

    return module.directive('chat', function(ChatService, AuthService) {
        return {
            restrict: 'EA',
            templateUrl: 'modules/chat/chatTemplate.html',
            replace: true,
            link: function($scope, element, attrs) {
                $scope.private = "";

                var updateUsers = function() {
                    var users = ChatService.getUsers();
                    var otherUsers = _.without(users, AuthService.getUser());

                    if ($scope.private && users.indexOf($scope.private) == -1) {
                        $scope.private = "";
                    }
                    $scope.usersString = users.join(',');
                    $scope.otherUsers = otherUsers;
                };
                updateUsers();

                $scope.messages = ChatService.getMessages();
                var addMessage = function(message) {
                    $scope.$apply(function() {
                        $scope.messages.unshift(message);
                    });
                };
                ChatService.on('chat:message', function(data) {
                    addMessage(data);
                });
                ChatService.on('chat:private', function(data) {
                    addMessage(data);
                });
                ChatService.on('chat:messages', function(data) {
                    $scope.$apply(function() {
                        $scope.messages = ChatService.getMessages();
                    });
                });

                $scope.privateFilter = function(message) {
                    if (!$scope.private) return true;
                    return message.private == $scope.private;
                };

                ChatService.on('participants', function(data) {
                    $scope.$apply(function() {
                        updateUsers();
                    });
                    
                });

                $scope.sendMessage = function() {
                    if ($scope.message) {
                        if ($scope.private) {
                            ChatService.private($scope.private, $scope.message);
                        } else {
                            ChatService.message($scope.message);
                        }
                        $scope.message = '';
                    }
                };
            }
        };
    });
});