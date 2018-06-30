const controller = require('../controllers/controllers.js');


// Check if a user is logged in!
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/');
  return null;
}

module.exports = function addRoutes(router, passport) {
  /** ****************************************************************************
  ===============================================================================
  Authorization Routes
  ===============================================================================
  ****************************************************************************** */
  router.get('/login', controller.userControllers.login);
  router.get('/signup', controller.userControllers.signup);
  router.get('/profile', isLoggedIn, controller.userControllers.profile);
  router.get('/logout', controller.userControllers.logout);
  router.get('/changeprofile', controller.userControllers.changeProfile);
  router.get('/Ranking', isLoggedIn, controller.userControllers.ranking);


  router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/map',
    failureRedirect: '/login',
    failureFlash: true
  }));
  router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/map',
    failureRedirect: '/signup',
    failureFlash: true
  }));
  router.post('/changeprofile', passport.authenticate('local-changeprofile', {
    successRedirect: '/profile',
    failureRedirect: '/changeprofile',
    failureFlash: true
  }));

  // Facebook passport routes
  router.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['public_profile', 'email']
  }));

  router.get(
    '/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/map',
      failureRedirect: '/'
    })
  );

  // Google passport Routes
  router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  // the callback after google has authenticated the user
  router.get(
    '/auth/google/callback',
    passport.authenticate('google', {
      successRedirect: '/map',
      failureRedirect: '/'
    })
  );

  // route for logging out
  router.get('/logout', function logout(req, res) {
    req.logout();
    res.redirect('/');
  });

  /** *******************************************
  =============================================
  connect other accounts routes
  =============================================
  ******************************************** */


  // locally
  router.get('/connect/local', function localConnect(req, res) {
    res.render('connect-local.ejs', { message: req.flash('loginMessage') });
  });
  router.post('/connect/local', passport.authenticate('local-signup', {
    successRedirect: '/map', // redirect to the secure profile section
    failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // Facebook
  router.get('/connect/facebook', passport.authorize('facebook', {
    scope: ['public_profile', 'email']
  }));

  router.get(
    '/connect/facebook/callback',
    passport.authorize('facebook', {
      successRedirect: '/map',
      failureRedirect: '/'
    })
  );


  // Google
  router.get('/connect/google', passport.authorize('google', { scope: ['profile', 'email'] }));

  router.get(
    '/connect/google/callback',
    passport.authorize('google', {
      successRedirect: '/map',
      failureRedirect: '/'
    })
  );


  /** *******************************************
  =============================================
  unlink other accounts routes
  =============================================
  ******************************************** */
  // local -----------------------------------
  router.get('/unlink/local', controller.userControllers.unlink.local);

  // facebook -------------------------------
  router.get('/unlink/facebook', controller.userControllers.unlink.facebook);


  // google ---------------------------------
  router.get('/unlink/google', controller.userControllers.unlink.google);
};
