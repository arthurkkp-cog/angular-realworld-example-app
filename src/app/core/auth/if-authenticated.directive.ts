// AngularJS If Authenticated Directive
// Conditionally shows/hides content based on authentication status
// Note: In AngularJS, we use ng-if with isAuthenticated scope variable instead
// This file is kept for reference but the functionality is handled by ng-if in templates

// Usage in templates:
// ng-if="isAuthenticated" - show when logged in
// ng-if="!isAuthenticated" - show when logged out

// The isAuthenticated variable is set in controllers that need it:
// $scope.isAuthenticated = UserService.isAuthenticated();
// $scope.$on('userUpdated', function(event, user) {
//   $scope.isAuthenticated = !!user;
// });

// This directive is not needed in AngularJS as we use ng-if directly
// with the isAuthenticated scope variable
