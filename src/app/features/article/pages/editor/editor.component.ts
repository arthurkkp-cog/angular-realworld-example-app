// AngularJS Editor Controller
// Handles article creation and editing

interface Article {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  author: { username: string };
}

interface Errors {
  errors: { [key: string]: string };
}

angular.module('conduitApp').controller('EditorController', [
  '$scope',
  '$location',
  '$routeParams',
  '$q',
  'ArticlesService',
  'UserService',
  function (
    $scope: angular.IScope & {
      formData: { title: string; description: string; body: string };
      tagList: string[];
      tagField: string;
      errors: Errors | null;
      isSubmitting: boolean;
      addTag: () => void;
      removeTag: (tag: string) => void;
      submitForm: () => void;
    },
    $location: angular.ILocationService,
    $routeParams: angular.route.IRouteParamsService,
    $q: angular.IQService,
    ArticlesService: any,
    UserService: any,
  ) {
    // Initialize form data
    $scope.formData = {
      title: '',
      description: '',
      body: '',
    };
    $scope.tagList = [];
    $scope.tagField = '';
    $scope.errors = null;
    $scope.isSubmitting = false;

    // Load existing article if editing
    const slug = $routeParams['slug'];
    if (slug) {
      $q.all([ArticlesService.get(slug), UserService.getCurrentUser()]).then(
        function (results: [Article, { user: { username: string } }]) {
          const article = results[0];
          const user = results[1].user;
          if (user.username === article.author.username) {
            $scope.formData = {
              title: article.title,
              description: article.description,
              body: article.body,
            };
            $scope.tagList = article.tagList || [];
          } else {
            $location.path('/');
          }
        },
        function () {
          $location.path('/');
        },
      );
    }

    // Add tag handler
    $scope.addTag = function (): void {
      const tag = $scope.tagField.trim();
      if (tag && $scope.tagList.indexOf(tag) < 0) {
        $scope.tagList.push(tag);
      }
      $scope.tagField = '';
    };

    // Remove tag handler
    $scope.removeTag = function (tagName: string): void {
      $scope.tagList = $scope.tagList.filter(function (tag) {
        return tag !== tagName;
      });
    };

    // Submit form handler
    $scope.submitForm = function (): void {
      $scope.isSubmitting = true;
      $scope.addTag();

      const articleData = {
        title: $scope.formData.title,
        description: $scope.formData.description,
        body: $scope.formData.body,
        tagList: $scope.tagList,
      };

      const promise = slug
        ? ArticlesService.update({ ...articleData, slug: slug })
        : ArticlesService.create(articleData);

      promise.then(
        function (article: Article) {
          $location.path('/article/' + article.slug);
        },
        function (err: Errors) {
          $scope.errors = err;
          $scope.isSubmitting = false;
        },
      );
    };
  },
]);
