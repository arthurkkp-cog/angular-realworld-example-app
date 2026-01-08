// AngularJS Footer Directive
// Static footer component

angular.module('conduitApp').directive('appLayoutFooter', [
  function () {
    return {
      restrict: 'E',
      templateUrl: 'app/core/layout/footer.component.html',
      controller: [
        '$scope',
        function ($scope: angular.IScope & { today: Date }) {
          $scope.today = new Date();
        },
      ],
    };
  },
]);
