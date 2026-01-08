// AngularJS Markdown Filter
// Converts markdown content to HTML using the marked library
// Note: The marked library is loaded via CDN in index.html

angular.module('conduitApp').filter('markdown', [
  '$sce',
  function ($sce: angular.ISCEService) {
    return function (content: string): any {
      if (!content) {
        return '';
      }
      // marked is loaded globally via CDN
      const html = (window as any).marked.parse(content);
      return $sce.trustAsHtml(html);
    };
  },
]);
