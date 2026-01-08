// AngularJS Article Controller
// Handles article display, comments, and interactions

interface Profile {
  username: string;
  bio: string;
  image: string;
  following: boolean;
}

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
  author: Profile;
}

interface Comment {
  id: number;
  body: string;
  createdAt: string;
  author: Profile;
}

interface User {
  email: string;
  token: string;
  username: string;
  bio: string;
  image: string;
}

interface Errors {
  errors: { [key: string]: string };
}

angular.module('conduitApp').controller('ArticleController', [
  '$scope',
  '$location',
  '$routeParams',
  '$q',
  '$sce',
  'ArticlesService',
  'CommentsService',
  'UserService',
  function (
    $scope: angular.IScope & {
      article: Article | null;
      currentUser: User | null;
      comments: Comment[];
      canModify: boolean;
      commentText: string;
      commentFormErrors: Errors | null;
      isSubmitting: boolean;
      isDeleting: boolean;
      isAuthenticated: boolean;
      articleBodyHtml: string;
      onToggleFavorite: (favorited: boolean) => void;
      toggleFollowing: (profile: Profile) => void;
      deleteArticle: () => void;
      addComment: () => void;
      deleteComment: (comment: Comment) => void;
      favoriteArticle: () => void;
      unfavoriteArticle: () => void;
      followAuthor: () => void;
      unfollowAuthor: () => void;
    },
    $location: angular.ILocationService,
    $routeParams: angular.route.IRouteParamsService,
    $q: angular.IQService,
    $sce: angular.ISCEService,
    ArticlesService: any,
    CommentsService: any,
    UserService: any,
  ) {
    // Initialize controller properties
    $scope.article = null;
    $scope.currentUser = null;
    $scope.comments = [];
    $scope.canModify = false;
    $scope.commentText = '';
    $scope.commentFormErrors = null;
    $scope.isSubmitting = false;
    $scope.isDeleting = false;
    $scope.isAuthenticated = UserService.isAuthenticated();
    $scope.articleBodyHtml = '';

    // Load article and comments
    const slug = $routeParams['slug'];
    $q.all([ArticlesService.get(slug), CommentsService.getAll(slug)]).then(
      function (results: [Article, Comment[]]) {
        $scope.article = results[0];
        $scope.comments = results[1];
        $scope.currentUser = UserService.getCurrentUserValue();
        $scope.canModify = $scope.currentUser?.username === $scope.article.author.username;

        // Parse markdown body
        if (typeof marked !== 'undefined' && $scope.article.body) {
          $scope.articleBodyHtml = $sce.trustAsHtml(marked.parse($scope.article.body));
        }
      },
      function () {
        $location.path('/');
      },
    );

    // Toggle favorite handler
    $scope.onToggleFavorite = function (favorited: boolean): void {
      if ($scope.article) {
        $scope.article.favorited = favorited;
        if (favorited) {
          $scope.article.favoritesCount++;
        } else {
          $scope.article.favoritesCount--;
        }
      }
    };

    // Favorite article
    $scope.favoriteArticle = function (): void {
      if (!$scope.isAuthenticated) {
        $location.path('/login');
        return;
      }
      if ($scope.article) {
        ArticlesService.favorite($scope.article.slug).then(function (article: Article) {
          $scope.article = article;
        });
      }
    };

    // Unfavorite article
    $scope.unfavoriteArticle = function (): void {
      if ($scope.article) {
        ArticlesService.unfavorite($scope.article.slug).then(function () {
          if ($scope.article) {
            $scope.article.favorited = false;
            $scope.article.favoritesCount--;
          }
        });
      }
    };

    // Toggle following handler
    $scope.toggleFollowing = function (profile: Profile): void {
      if ($scope.article) {
        $scope.article.author.following = profile.following;
      }
    };

    // Delete article handler
    $scope.deleteArticle = function (): void {
      $scope.isDeleting = true;
      if ($scope.article) {
        ArticlesService.delete($scope.article.slug).then(function () {
          $location.path('/');
        });
      }
    };

    // Add comment handler
    $scope.addComment = function (): void {
      $scope.isSubmitting = true;
      $scope.commentFormErrors = null;

      if ($scope.article) {
        CommentsService.add($scope.article.slug, $scope.commentText).then(
          function (comment: Comment) {
            $scope.comments.unshift(comment);
            $scope.commentText = '';
            $scope.isSubmitting = false;
          },
          function (errors: Errors) {
            $scope.isSubmitting = false;
            $scope.commentFormErrors = errors;
          },
        );
      }
    };

    // Delete comment handler
    $scope.deleteComment = function (comment: Comment): void {
      if ($scope.article) {
        CommentsService.delete(comment.id, $scope.article.slug).then(function () {
          $scope.comments = $scope.comments.filter(function (item) {
            return item !== comment;
          });
        });
      }
    };
  },
]);
