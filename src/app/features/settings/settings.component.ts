// AngularJS Settings Controller
// Handles user settings form

interface User {
  email: string;
  token: string;
  username: string;
  bio: string;
  image: string;
}

interface Errors {
  errors: { [key: string]: string };
}

angular.module('conduitApp').controller('SettingsController', [
  '$scope',
  '$location',
  'UserService',
  function (
    $scope: angular.IScope & {
      formData: Partial<User>;
      errors: Errors | null;
      isSubmitting: boolean;
      submitForm: () => void;
      logout: () => void;
    },
    $location: angular.ILocationService,
    UserService: any,
  ) {
    // Initialize form data with current user
    const currentUser = UserService.getCurrentUserValue();
    $scope.formData = {
      image: currentUser?.image || '',
      username: currentUser?.username || '',
      bio: currentUser?.bio || '',
      email: currentUser?.email || '',
      password: '',
    };
    $scope.errors = null;
    $scope.isSubmitting = false;

    // Submit form handler
    $scope.submitForm = function (): void {
      $scope.isSubmitting = true;
      $scope.errors = null;

      UserService.update($scope.formData).then(
        function (response: { user: User }) {
          $location.path('/profile/' + response.user.username);
        },
        function (err: Errors) {
          $scope.errors = err;
          $scope.isSubmitting = false;
        },
      );
    };

    // Logout handler
    $scope.logout = function (): void {
      UserService.logout();
    };
  },
]);
