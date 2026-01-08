// AngularJS API Interceptor
// Prepends the base API URL to all outgoing requests

angular.module('conduitApp').factory('apiInterceptor', [
  function () {
    const API_URL = 'https://api.realworld.show/api';

    return {
      request: function (config: angular.IRequestConfig): angular.IRequestConfig {
        // Prepend API URL to all requests
        if (config.url && !config.url.startsWith('http')) {
          config.url = API_URL + config.url;
        }
        return config;
      },
    };
  },
]);
