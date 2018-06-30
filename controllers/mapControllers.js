const Cache = require('../models/cache.js');

function get(req, res) {
  Cache.find({}, (err, caches) => {
    res.render('../views/mapPage.ejs', {
      mapCenter: { lat: -37.788868, lng: 144.969674 },
      markers: caches
    });
  });
}

module.exports = {
  get
};
