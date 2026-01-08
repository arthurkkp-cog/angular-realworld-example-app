// AngularJS Home Controller
// Handles the home page with article feeds and tags

interface ArticleListConfig {
  type: string;
  filters: {
    tag?: string;
    author?: string;
    favorited?: string;
    limit?: number;
    offset?: number;
  };
}

angular.module('conduitApp').controller('HomeController', [
  '$scope',
  '$location',
  'UserService',
  'TagsService',
  'ArticlesService',
  function (
    $scope: angular.IScope & {
      isAuthenticated: boolean;
      listConfig: ArticleListConfig;
      tags: string[];
      tagsLoaded: boolean;
      articles: any[];
      articlesLoaded: boolean;
      totalPages: number[];
      currentPage: number;
      setListTo: (type: string, filters?: any) => void;
      setPageTo: (page: number) => void;
    },
    $location: angular.ILocationService,
    UserService: any,
    TagsService: any,
    ArticlesService: any,
  ) {
    // Initialize controller properties
    $scope.isAuthenticated = UserService.isAuthenticated();
    $scope.listConfig = {
      type: $scope.isAuthenticated ? 'feed' : 'all',
      filters: {},
    };
    $scope.tags = [];
    $scope.tagsLoaded = false;
    $scope.articles = [];
    $scope.articlesLoaded = false;
    $scope.totalPages = [];
    $scope.currentPage = 1;

    const limit = 10;

    // Load tags
    TagsService.getAll().then(function (tags: string[]) {
      $scope.tags = tags;
      $scope.tagsLoaded = true;
    });

    // Load articles based on current config
    function loadArticles(): void {
      $scope.articlesLoaded = false;
      $scope.articles = [];

      const config = {
        ...$scope.listConfig,
        filters: {
          ...$scope.listConfig.filters,
          limit: limit,
          offset: limit * ($scope.currentPage - 1),
        },
      };

      ArticlesService.query(config).then(function (data: { articles: any[]; articlesCount: number }) {
        $scope.articles = data.articles;
        $scope.articlesLoaded = true;
        $scope.totalPages = Array.from(
          new Array(Math.ceil(data.articlesCount / limit)),
          function (val: any, index: number) {
            return index + 1;
          },
        );
      });
    }

    // Initial load
    loadArticles();

    // Set list type handler
    $scope.setListTo = function (type: string, filters: any = {}): void {
      // If feed is requested but user is not authenticated, redirect to login
      if (type === 'feed' && !$scope.isAuthenticated) {
        $location.path('/login');
        return;
      }

      // Otherwise, set the list object and reload
      $scope.listConfig = { type: type, filters: filters };
      $scope.currentPage = 1;
      loadArticles();
    };

    // Set page handler
    $scope.setPageTo = function (page: number): void {
      $scope.currentPage = page;
      loadArticles();
    };

    // Listen for user updates
    $scope.$on('userUpdated', function (event: angular.IAngularEvent, user: any) {
      $scope.isAuthenticated = !!user;
    });
  },
]);
