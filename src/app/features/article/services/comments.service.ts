// AngularJS Comments Service
// Handles comment CRUD operations for articles

interface Comment {
  id: number;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: {
    username: string;
    bio: string;
    image: string;
    following: boolean;
  };
}

angular.module('conduitApp').factory('CommentsService', [
  '$http',
  function ($http: angular.IHttpService) {
    return {
      getAll: function (slug: string): angular.IPromise<Comment[]> {
        return $http.get<{ comments: Comment[] }>('/articles/' + slug + '/comments').then(function (response) {
          return response.data.comments;
        });
      },

      add: function (slug: string, payload: string): angular.IPromise<Comment> {
        return $http
          .post<{ comment: Comment }>('/articles/' + slug + '/comments', {
            comment: { body: payload },
          })
          .then(function (response) {
            return response.data.comment;
          });
      },

      delete: function (commentId: number, slug: string): angular.IPromise<void> {
        return $http.delete<void>('/articles/' + slug + '/comments/' + commentId).then(function () {
          return;
        });
      },
    };
  },
]);
