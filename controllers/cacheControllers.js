const Cache = require('../models/cache.js');
const Data = require('../models/data.js').dataModel;

// https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}


function cacheGet(req, res) {
  Cache.findOne({ id: req.query.cacheID }, (err, cache) => {
    if (err) { throw err; }
    res.render('../views/cache.ejs', {
      cache,
      openAttempted: false,
      isAdmin: req.user.data.isAdminUser
    });
  });
}

function addCachePost(req, res) {
  if (req.body.cacheID === undefined) {
    newCache(req, res);
  }
  else {
    console.log("Cache should be updated");
    updateCache(req, res);
  }
}

function newCache(req, res) {
  if (!req.user.data.isAdminUser) {
    res.redirect('/');
  }
  Cache.find({}, (err, caches) => {
    let newCache = new Cache();
    newCache.id = caches.length;
    newCache.location = {
      lat: req.body.lat,
      lng: req.body.lng,
      imgSmall: req.body.imgSmall,
      imgLarge: req.body.imgLarge,
      description: req.body.description,
      name: req.body.name
    }
    newCache.data = []
    newCache.save((err2) => {
      if (err2) { throw err2 }
      res.render('../views/cache.ejs', {
        cache: newCache,
        openAttempted: false,
        isAdmin: req.user.data.isAdminUser
      });
    })
  })
}

function updateCache(req, res) {
  Cache.findOne({'id': req.body.cacheID}, (err, cache) => {
    cache.location = {
      lat: cache.location.lat, //Lat and lng cant be changed
      lng: cache.location.lng,
      imgSmall: req.body.imgSmall ? req.body.imgSmall : cache.location.imgSmall,
      imgLarge: req.body.imgLarge ? req.body.imgLarge : cache.location.imgLarge,
      description: req.body.description ? req.body.description : cache.location.description,
      name: req.body.name ? req.body.name : cache.location.name
    }
    cache.save((err2) => {
      if (err2) { throw err2 }
      res.render('../views/cache.ejs', {
        cache: cache,
        openAttempted: false,
        isAdmin: req.user.data.isAdminUser
      })
    })
  });
}

function addCacheDelete(req, res) {
  if (!req.user.data.isAdminUser) {
    res.redirect('/');
  }
  Cache.find({ "id" : req.body.id}).remove((err) => {
    if (err) { throw err }
    console.log(`Cache ${req.body.id} deleted`);
    res.redirect('/');
  });
}

function addCacheGet(req, res) {
  if (!req.user.data.isAdminUser) {
    res.redirect('/');
  }
  res.render('../views/addCache.ejs');
}

function openCacheGet(req, res) {
  Cache.findOne({ id: req.query.cacheID }, (err, cache) => {
    if (!cache) {
      res.redirect('/');
    }
    let lat1 = cache.location.lat;
    let lng1 = cache.location.lng;
    let lat2 = req.query.lat;
    let lng2 = req.query.lng;
    // 0.05 = 50m
    let closeEnough = getDistanceFromLatLonInKm(lat1, lng1, lat2, lng2) < 0.2; //200 m

    if (!closeEnough) {
      res.render('../views/cache.ejs', {
        cache,
        openAttempted: true,
        isAdmin: req.user.data.isAdminUser
      });
    } else {

      if (!req.user.data.score) {
        req.user.data.score = 0;
      }

      Cache.findOne({ id: req.user.data.lastCacheOpened }, (err2, lastCache) => {
        if (err) { throw err }
        if (lastCache) {
          let lat1 = lastCache.location.lat;
          let lng1 = lastCache.location.lng;
          let lat2 = cache.location.lat;
          let lng2 = cache.location.lng;
          req.user.data.score += getDistanceFromLatLonInKm(lat1, lng1, lat2, lng2) * 10
          req.user.data.score = Math.round(req.user.data.score * 100) / 100 //Round to 2 D.P
        }
        else {
          req.user.data.score += 5; //5 points for first cache
        }
        req.user.data.lastCacheOpened = req.query.cacheID;
        req.user.save((err3) => {
          if (err3) { throw err3 }

          cache.data.filter((post) => {
            let now = new Date();
            return now.getTime() - post.datePosted.getTime() < post.lifetime
          })

          cache.save((err4) => {
            if (err4) { throw err4 }
            res.render('../views/openCache.ejs', {
              cache
            });
          })
        })
      })
    }
  });
}

function openCachePost(req, res) {
  // Add a post to a cache
  Cache.findOne({ id: req.body.cacheID }, (err, cache) => {
    const newPost = new Data();

    newPost.id = cache.data.length;
    newPost.title = req.body.postTitle;
    newPost.datePosted = new Date();
    newPost.lifetime = 6.048e+8; // 1 day in ms
    newPost.data = {
      url: req.body.urlInput,
      text: req.body.descInput
    };
    newPost.adminPost = null;
    if (req.user.data.isAdminUser) {
      newPost.adminPost = {
        reward: "Itunes $10 gift voucher! {FAKECODE}",
        claimed: false
      }
    }
    // Add id here
    newPost.postedBy = req.user.data.id;
    if (cache.data == null) {
      cache.data = [];
    }
    cache.data.push(newPost);
    cache.save((err) => {
      if (err) { throw err; }
      res.render('../views/openCache.ejs', {
        cache
      });
    });
  });
}

function openCacheDelete(req, res) {
  //Delete a post
  Cache.findOne({ id: req.body.cacheID }, (err, cache) => {
    if (err) { throw err }
    const postToDelete = cache.data.find(e => e.id === req.body.cacheID);
    const deleteIndex = cache.data.indexOf(postToDelete);
    if (postToDelete.postedBy !== req.user.data.id) {
      console.log("This user is not authorised to delete that post!");
      res.render('../views/openCache.ejs', {
        cache
      })
    }
    else {
      cache.data.splice(deleteIndex, 1);
      cache.save((err2) => {
        if (err2) { throw err2 }
        console.log("Post deleted");
        res.render('../views/openCache.ejs', {
          cache
        })
      });
    }
  });
}

module.exports = {
  cacheGet,
  addCache: {
    get: addCacheGet,
    post: addCachePost,
    delete: addCacheDelete
  },
  openCache: {
    get: openCacheGet,
    post: openCachePost,
    delete: openCacheDelete
  }
};
