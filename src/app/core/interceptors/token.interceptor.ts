// AngularJS Token Interceptor
// Injects JWT token into Authorization header for authenticated requests

angular.module('conduitApp').factory('tokenInterceptor', [
  'JwtService',
  function (JwtService: any) {
    return {
      request: function (config: angular.IRequestConfig): angular.IRequestConfig {
        const token = JwtService.getToken();
        if (token) {
          config.headers = config.headers || {};
          config.headers['Authorization'] = 'Token ' + token;
        }
        return config;
      },
    };
  },
]);
