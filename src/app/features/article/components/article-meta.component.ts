// AngularJS Article Meta Directive
// Displays article metadata (author, date) with transcluded content

angular.module('conduitApp').directive('appArticleMeta', [
  function () {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        article: '=',
      },
      template: `
        <div class="article-meta">
          <a ng-href="#!/profile/{{ article.author.username }}">
            <img ng-src="{{ article.author.image }}" />
          </a>

          <div class="info">
            <a class="author" ng-href="#!/profile/{{ article.author.username }}">
              {{ article.author.username }}
            </a>
            <span class="date">
              {{ article.createdAt | date: 'longDate' }}
            </span>
          </div>

          <ng-transclude></ng-transclude>
        </div>
      `,
    };
  },
]);
