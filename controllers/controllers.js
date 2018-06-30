// Export all our controllers together.
const homepage = require('./homepage.js');
const userControllers = require('./userControllers.js');
const mapControllers = require('./mapControllers');
const cacheControllers = require('./cacheControllers');


module.exports = {
  homepage,
  userControllers,
  mapControllers,
  cacheControllers
};
