// AngularJS Article Preview Directive
// Displays article preview with meta info and favorite button

angular.module('conduitApp').directive('appArticlePreview', [
  function () {
    return {
      restrict: 'E',
      scope: {
        article: '=',
      },
      template: `
        <div class="article-preview">
          <app-article-meta article="article">
            <button
              class="btn btn-sm pull-xs-right"
              ng-class="{ 'btn-primary': article.favorited, 'btn-outline-primary': !article.favorited }"
              ng-click="toggleFavorite()"
            >
              <i class="ion-heart"></i> {{ article.favoritesCount }}
            </button>
          </app-article-meta>

          <a ng-href="#!/article/{{ article.slug }}" class="preview-link">
            <h1>{{ article.title }}</h1>
            <p>{{ article.description }}</p>
            <span>Read more...</span>
            <ul class="tag-list">
              <li ng-repeat="tag in article.tagList track by $index" class="tag-default tag-pill tag-outline">
                {{ tag }}
              </li>
            </ul>
          </a>
        </div>
      `,
      controller: [
        '$scope',
        '$location',
        'ArticlesService',
        'UserService',
        function (
          $scope: angular.IScope & {
            article: any;
            toggleFavorite: () => void;
          },
          $location: angular.ILocationService,
          ArticlesService: any,
          UserService: any,
        ) {
          $scope.toggleFavorite = function (): void {
            if (!UserService.isAuthenticated()) {
              $location.path('/login');
              return;
            }

            if ($scope.article.favorited) {
              ArticlesService.unfavorite($scope.article.slug).then(function (article: any) {
                $scope.article.favorited = false;
                $scope.article.favoritesCount--;
              });
            } else {
              ArticlesService.favorite($scope.article.slug).then(function (article: any) {
                $scope.article.favorited = true;
                $scope.article.favoritesCount++;
              });
            }
          };
        },
      ],
    };
  },
]);
