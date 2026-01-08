// AngularJS Application Bootstrap
// This file initializes the AngularJS application module

// Define the main application module with dependencies
angular.module('conduitApp', ['ngRoute', 'ngSanitize']);

// Manual bootstrap (alternative to ng-app directive)
// angular.element(document).ready(function() {
//   angular.bootstrap(document, ['conduitApp']);
// });
