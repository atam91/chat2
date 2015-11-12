define(['./module'], function(module) {
    'use strict';

    return module.directive('chat', function(ChatService, AuthService) {
        return {
            restrict: 'EA',
            templateUrl: 'modules/chat/chatTemplate.html',
            replace: true,
            link: function($scope, element, attrs) {
                $scope.private = '';

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

                $scope.sendMessage = function() {
                    if ($scope.message) {
                        if ($scope.private) {
                            ChatService.sendPrivate($scope.private, $scope.message);
                        } else {
                            ChatService.sendMessage($scope.message);
                        }
                        $scope.message = '';
                    }
                };
            }
        };
    });
});