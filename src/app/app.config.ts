// AngularJS Application Configuration
// Route configuration using $routeProvider

angular.module('conduitApp').config([
  '$routeProvider',
  '$locationProvider',
  '$httpProvider',
  function (
    $routeProvider: angular.route.IRouteProvider,
    $locationProvider: angular.ILocationProvider,
    $httpProvider: angular.IHttpProvider,
  ) {
    // Enable HTML5 mode for clean URLs
    $locationProvider.html5Mode(true);

    // Configure routes
    $routeProvider
      .when('/', {
        templateUrl: 'app/features/article/pages/home/home.component.html',
        controller: 'HomeController',
        controllerAs: '$ctrl',
      })
      .when('/login', {
        templateUrl: 'app/core/auth/auth.component.html',
        controller: 'AuthController',
        controllerAs: '$ctrl',
        resolve: {
          authType: function () {
            return 'login';
          },
        },
      })
      .when('/register', {
        templateUrl: 'app/core/auth/auth.component.html',
        controller: 'AuthController',
        controllerAs: '$ctrl',
        resolve: {
          authType: function () {
            return 'register';
          },
        },
      })
      .when('/settings', {
        templateUrl: 'app/features/settings/settings.component.html',
        controller: 'SettingsController',
        controllerAs: '$ctrl',
      })
      .when('/editor', {
        templateUrl: 'app/features/article/pages/editor/editor.component.html',
        controller: 'EditorController',
        controllerAs: '$ctrl',
      })
      .when('/editor/:slug', {
        templateUrl: 'app/features/article/pages/editor/editor.component.html',
        controller: 'EditorController',
        controllerAs: '$ctrl',
      })
      .when('/article/:slug', {
        templateUrl: 'app/features/article/pages/article/article.component.html',
        controller: 'ArticleController',
        controllerAs: '$ctrl',
      })
      .when('/profile/:username', {
        templateUrl: 'app/features/profile/pages/profile/profile.component.html',
        controller: 'ProfileController',
        controllerAs: '$ctrl',
      })
      .when('/profile/:username/favorites', {
        templateUrl: 'app/features/profile/pages/profile/profile.component.html',
        controller: 'ProfileController',
        controllerAs: '$ctrl',
      })
      .otherwise({
        redirectTo: '/',
      });

    // Register HTTP interceptors
    $httpProvider.interceptors.push('apiInterceptor');
    $httpProvider.interceptors.push('tokenInterceptor');
    $httpProvider.interceptors.push('errorInterceptor');
  },
]);

// Application run block for initialization
angular.module('conduitApp').run([
  'JwtService',
  'UserService',
  function (JwtService: any, UserService: any) {
    // Initialize authentication state on app startup
    if (JwtService.getToken()) {
      UserService.getCurrentUser();
    }
  },
]);

// Route change event handler for authentication guards
angular.module('conduitApp').run([
  '$rootScope',
  '$location',
  'UserService',
  function ($rootScope: angular.IRootScopeService, $location: angular.ILocationService, UserService: any) {
    $rootScope.$on('$routeChangeStart', function (event: angular.IAngularEvent, next: any) {
      const protectedRoutes = ['/settings', '/editor'];
      const guestOnlyRoutes = ['/login', '/register'];
      const currentPath = $location.path();

      // Check if route requires authentication
      const requiresAuth = protectedRoutes.some(function (route) {
        return currentPath.startsWith(route);
      });

      // Check if route is for guests only
      const guestOnly = guestOnlyRoutes.some(function (route) {
        return currentPath === route;
      });

      if (requiresAuth && !UserService.isAuthenticated()) {
        event.preventDefault();
        $location.path('/login');
      }

      if (guestOnly && UserService.isAuthenticated()) {
        event.preventDefault();
        $location.path('/');
      }
    });
  },
]);
