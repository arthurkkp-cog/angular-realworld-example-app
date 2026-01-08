// AngularJS Header Directive
// Global navigation component with authentication-aware menu

angular.module('conduitApp').directive('appLayoutHeader', [
  function () {
    return {
      restrict: 'E',
      templateUrl: 'app/core/layout/header.component.html',
      controller: [
        '$scope',
        '$location',
        'UserService',
        function (
          $scope: angular.IScope & {
            currentUser: any;
            isAuthenticated: boolean;
            isActive: (path: string) => boolean;
          },
          $location: angular.ILocationService,
          UserService: any,
        ) {
          $scope.currentUser = UserService.getCurrentUserValue();
          $scope.isAuthenticated = UserService.isAuthenticated();

          // Check if current path matches
          $scope.isActive = function (path: string): boolean {
            return $location.path() === path;
          };

          // Listen for user updates
          $scope.$on('userUpdated', function (event: angular.IAngularEvent, user: any) {
            $scope.currentUser = user;
            $scope.isAuthenticated = !!user;
          });
        },
      ],
    };
  },
]);
