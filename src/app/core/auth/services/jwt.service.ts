// AngularJS JWT Service
// Handles JWT token storage in localStorage

angular.module('conduitApp').factory('JwtService', [
  '$window',
  function ($window: angular.IWindowService) {
    const TOKEN_KEY = 'jwtToken';

    return {
      getToken: function (): string {
        return $window.localStorage.getItem(TOKEN_KEY) || '';
      },

      saveToken: function (token: string): void {
        $window.localStorage.setItem(TOKEN_KEY, token);
      },

      destroyToken: function (): void {
        $window.localStorage.removeItem(TOKEN_KEY);
      },
    };
  },
]);
