// AngularJS Profile Controller
// Handles user profile display and article lists

interface Profile {
  username: string;
  bio: string;
  image: string;
  following: boolean;
}

interface Article {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: Profile;
}

angular.module('conduitApp').controller('ProfileController', [
  '$scope',
  '$location',
  '$routeParams',
  'ProfileService',
  'ArticlesService',
  'UserService',
  function (
    $scope: angular.IScope & {
      profile: Profile | null;
      isUser: boolean;
      articles: Article[];
      articlesLoaded: boolean;
      totalPages: number[];
      currentPage: number;
      activeTab: string;
      onToggleFollowing: (profile: Profile) => void;
      setTab: (tab: string) => void;
      setPageTo: (page: number) => void;
      followUser: () => void;
      unfollowUser: () => void;
    },
    $location: angular.ILocationService,
    $routeParams: angular.route.IRouteParamsService,
    ProfileService: any,
    ArticlesService: any,
    UserService: any,
  ) {
    // Initialize controller properties
    $scope.profile = null;
    $scope.isUser = false;
    $scope.articles = [];
    $scope.articlesLoaded = false;
    $scope.totalPages = [];
    $scope.currentPage = 1;
    $scope.activeTab = $location.path().includes('/favorites') ? 'favorites' : 'articles';

    const username = $routeParams['username'];
    const limit = 10;

    // Load profile
    ProfileService.get(username).then(
      function (profile: Profile) {
        $scope.profile = profile;
        const currentUser = UserService.getCurrentUserValue();
        $scope.isUser = currentUser?.username === profile.username;
        loadArticles();
      },
      function () {
        $location.path('/');
      },
    );

    // Load articles based on active tab
    function loadArticles(): void {
      $scope.articlesLoaded = false;
      $scope.articles = [];

      const config = {
        type: 'all',
        filters: {
          limit: limit,
          offset: limit * ($scope.currentPage - 1),
          ...(($scope.activeTab === 'favorites' ? { favorited: username } : { author: username }) as any),
        },
      };

      ArticlesService.query(config).then(function (data: { articles: Article[]; articlesCount: number }) {
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

    // Toggle following handler
    $scope.onToggleFollowing = function (profile: Profile): void {
      $scope.profile = profile;
    };

    // Follow user
    $scope.followUser = function (): void {
      if (!UserService.isAuthenticated()) {
        $location.path('/login');
        return;
      }
      if ($scope.profile) {
        ProfileService.follow($scope.profile.username).then(function (profile: Profile) {
          $scope.profile = profile;
        });
      }
    };

    // Unfollow user
    $scope.unfollowUser = function (): void {
      if ($scope.profile) {
        ProfileService.unfollow($scope.profile.username).then(function (profile: Profile) {
          $scope.profile = profile;
        });
      }
    };

    // Set tab handler
    $scope.setTab = function (tab: string): void {
      $scope.activeTab = tab;
      $scope.currentPage = 1;
      loadArticles();
    };

    // Set page handler
    $scope.setPageTo = function (page: number): void {
      $scope.currentPage = page;
      loadArticles();
    };
  },
]);
