// AngularJS Error Interceptor
// Standardizes error responses by extracting the error property

angular.module('conduitApp').factory('errorInterceptor', [
  '$q',
  function ($q: angular.IQService) {
    return {
      responseError: function (rejection: angular.IHttpResponse<any>): angular.IPromise<any> {
        // Extract the error data from the response
        const error = rejection.data || rejection;
        return $q.reject(error);
      },
    };
  },
]);
