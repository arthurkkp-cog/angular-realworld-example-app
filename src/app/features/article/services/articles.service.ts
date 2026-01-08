// AngularJS Articles Service
// Handles article CRUD operations and favoriting

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
  author: {
    username: string;
    bio: string;
    image: string;
    following: boolean;
  };
}

interface ArticleListConfig {
  type: string;
  filters: {
    tag?: string;
    author?: string;
    favorited?: string;
    limit?: number;
    offset?: number;
  };
}

angular.module('conduitApp').factory('ArticlesService', [
  '$http',
  '$q',
  function ($http: angular.IHttpService, $q: angular.IQService) {
    return {
      query: function (config: ArticleListConfig): angular.IPromise<{ articles: Article[]; articlesCount: number }> {
        const url = '/articles' + (config.type === 'feed' ? '/feed' : '');
        return $http
          .get<{ articles: Article[]; articlesCount: number }>(url, {
            params: config.filters,
          })
          .then(function (response) {
            return response.data;
          });
      },

      get: function (slug: string): angular.IPromise<Article> {
        return $http.get<{ article: Article }>('/articles/' + slug).then(function (response) {
          return response.data.article;
        });
      },

      delete: function (slug: string): angular.IPromise<void> {
        return $http.delete<void>('/articles/' + slug).then(function () {
          return;
        });
      },

      create: function (article: Partial<Article>): angular.IPromise<Article> {
        return $http.post<{ article: Article }>('/articles/', { article: article }).then(function (response) {
          return response.data.article;
        });
      },

      update: function (article: Partial<Article>): angular.IPromise<Article> {
        return $http
          .put<{ article: Article }>('/articles/' + article.slug, { article: article })
          .then(function (response) {
            return response.data.article;
          });
      },

      favorite: function (slug: string): angular.IPromise<Article> {
        return $http.post<{ article: Article }>('/articles/' + slug + '/favorite', {}).then(function (response) {
          return response.data.article;
        });
      },

      unfavorite: function (slug: string): angular.IPromise<Article> {
        return $http.delete<{ article: Article }>('/articles/' + slug + '/favorite').then(function (response) {
          return response.data.article;
        });
      },
    };
  },
]);
