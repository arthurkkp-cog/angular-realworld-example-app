// AngularJS Profile Service
// Handles user profile retrieval and follow/unfollow operations

interface Profile {
  username: string;
  bio: string;
  image: string;
  following: boolean;
}

angular.module('conduitApp').factory('ProfileService', [
  '$http',
  function ($http: angular.IHttpService) {
    return {
      get: function (username: string): angular.IPromise<Profile> {
        return $http.get<{ profile: Profile }>('/profiles/' + username).then(function (response) {
          return response.data.profile;
        });
      },

      follow: function (username: string): angular.IPromise<Profile> {
        return $http.post<{ profile: Profile }>('/profiles/' + username + '/follow', {}).then(function (response) {
          return response.data.profile;
        });
      },

      unfollow: function (username: string): angular.IPromise<Profile> {
        return $http.delete<{ profile: Profile }>('/profiles/' + username + '/follow').then(function (response) {
          return response.data.profile;
        });
      },
    };
  },
]);
