// AngularJS Routes
// Routes are now configured in app.config.ts using $routeProvider
// This file is kept for reference only

// Route configuration has been moved to app.config.ts
// The following routes are configured:
// - '/' -> HomeController
// - '/login' -> AuthController (authType: 'login')
// - '/register' -> AuthController (authType: 'register')
// - '/settings' -> SettingsController (requires auth)
// - '/editor' -> EditorController (requires auth)
// - '/editor/:slug' -> EditorController (requires auth)
// - '/article/:slug' -> ArticleController
// - '/profile/:username' -> ProfileController
// - '/profile/:username/favorites' -> ProfileController

// Route guards are implemented in the $routeChangeStart event handler
// in app.config.ts using UserService.isAuthenticated()
