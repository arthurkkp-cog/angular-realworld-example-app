// AngularJS Auth Controller
// Handles login and registration forms

interface Errors {
  errors: { [key: string]: string };
}

angular.module('conduitApp').controller('AuthController', [
  '$scope',
  '$location',
  '$route',
  'UserService',
  'authType',
  function (
    $scope: angular.IScope & {
      authType: string;
      title: string;
      errors: Errors;
      isSubmitting: boolean;
      formData: { email: string; password: string; username?: string };
      submitForm: () => void;
    },
    $location: angular.ILocationService,
    $route: angular.route.IRouteService,
    UserService: any,
    authType: string,
  ) {
    // Initialize controller properties
    $scope.authType = authType || 'login';
    $scope.title = $scope.authType === 'login' ? 'Sign in' : 'Sign up';
    $scope.errors = { errors: {} };
    $scope.isSubmitting = false;
    $scope.formData = {
      email: '',
      password: '',
      username: '',
    };

    // Submit form handler
    $scope.submitForm = function (): void {
      $scope.isSubmitting = true;
      $scope.errors = { errors: {} };

      const credentials =
        $scope.authType === 'login'
          ? { email: $scope.formData.email, password: $scope.formData.password }
          : {
              email: $scope.formData.email,
              password: $scope.formData.password,
              username: $scope.formData.username,
            };

      const promise = $scope.authType === 'login' ? UserService.login(credentials) : UserService.register(credentials);

      promise.then(
        function () {
          $location.path('/');
        },
        function (err: Errors) {
          $scope.errors = err;
          $scope.isSubmitting = false;
        },
      );
    };
  },
]);
