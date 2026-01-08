// AngularJS Tags Service
// Handles fetching popular tags

angular.module('conduitApp').factory('TagsService', [
  '$http',
  function ($http: angular.IHttpService) {
    return {
      getAll: function (): angular.IPromise<string[]> {
        return $http.get<{ tags: string[] }>('/tags').then(function (response) {
          return response.data.tags;
        });
      },
    };
  },
]);
