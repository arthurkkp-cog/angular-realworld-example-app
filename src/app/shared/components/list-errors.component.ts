// AngularJS List Errors Directive
// Displays error messages from API responses

interface Errors {
  errors: { [key: string]: string[] };
}

angular.module('conduitApp').directive('appListErrors', [
  function () {
    return {
      restrict: 'E',
      templateUrl: 'app/shared/components/list-errors.component.html',
      scope: {
        errors: '=',
      },
      controller: [
        '$scope',
        function (
          $scope: angular.IScope & {
            errors: Errors | null;
            errorList: string[];
          },
        ) {
          $scope.errorList = [];

          $scope.$watch('errors', function (newErrors: Errors | null) {
            if (newErrors && newErrors.errors) {
              $scope.errorList = Object.keys(newErrors.errors).map(function (key) {
                return key + ' ' + newErrors.errors[key];
              });
            } else {
              $scope.errorList = [];
            }
          });
        },
      ],
    };
  },
]);
