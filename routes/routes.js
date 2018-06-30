const controller = require('../controllers/controllers.js');

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/');
  return null;
}

function isAdminUser(req, res, next) {
  if (req.user.data.isAdminUser === true) {
    return next();
  }
  res.redirect('/');
  return null;
}

module.exports = function addRoutes(router) {
  router.get('/', controller.homepage);

  router.get('/map', isLoggedIn, controller.mapControllers.get);

  router.get('/cache', isLoggedIn, controller.cacheControllers.cacheGet);
  router.get('/addCache', isAdminUser, controller.cacheControllers.addCache.get);
  router.post('/addCache', isAdminUser, controller.cacheControllers.addCache.post);
  router.delete('/addCache', isAdminUser, controller.cacheControllers.addCache.delete);
  router.get('/openCache', isLoggedIn, controller.cacheControllers.openCache.get);
  router.post('/openCache', isLoggedIn, controller.cacheControllers.openCache.post);
  router.delete('/openCache', isLoggedIn, controller.cacheControllers.openCache.delete);
};
