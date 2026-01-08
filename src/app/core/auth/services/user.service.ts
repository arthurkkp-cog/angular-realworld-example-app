// AngularJS User Service
// Handles user authentication state and API calls

interface User {
  email: string;
  token: string;
  username: string;
  bio: string;
  image: string;
}

angular.module('conduitApp').factory('UserService', [
  '$http',
  '$q',
  '$location',
  '$rootScope',
  'JwtService',
  function (
    $http: angular.IHttpService,
    $q: angular.IQService,
    $location: angular.ILocationService,
    $rootScope: angular.IRootScopeService,
    JwtService: any,
  ) {
    let currentUser: User | null = null;

    function setAuth(user: User): void {
      JwtService.saveToken(user.token);
      currentUser = user;
      $rootScope.$broadcast('userUpdated', user);
    }

    function purgeAuth(): void {
      JwtService.destroyToken();
      currentUser = null;
      $rootScope.$broadcast('userUpdated', null);
    }

    return {
      getCurrentUserValue: function (): User | null {
        return currentUser;
      },

      isAuthenticated: function (): boolean {
        return !!currentUser;
      },

      login: function (credentials: { email: string; password: string }): angular.IPromise<{ user: User }> {
        return $http.post<{ user: User }>('/users/login', { user: credentials }).then(function (response) {
          setAuth(response.data.user);
          return response.data;
        });
      },

      register: function (credentials: {
        username: string;
        email: string;
        password: string;
      }): angular.IPromise<{ user: User }> {
        return $http.post<{ user: User }>('/users', { user: credentials }).then(function (response) {
          setAuth(response.data.user);
          return response.data;
        });
      },

      logout: function (): void {
        purgeAuth();
        $location.path('/');
      },

      getCurrentUser: function (): angular.IPromise<{ user: User }> {
        return $http.get<{ user: User }>('/user').then(
          function (response) {
            setAuth(response.data.user);
            return response.data;
          },
          function (error) {
            purgeAuth();
            return $q.reject(error);
          },
        );
      },

      update: function (user: Partial<User>): angular.IPromise<{ user: User }> {
        return $http.put<{ user: User }>('/user', { user: user }).then(function (response) {
          currentUser = response.data.user;
          $rootScope.$broadcast('userUpdated', currentUser);
          return response.data;
        });
      },

      setAuth: setAuth,
      purgeAuth: purgeAuth,
    };
  },
]);
