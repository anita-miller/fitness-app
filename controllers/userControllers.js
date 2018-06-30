function login(req, res) {
  res.render('../views/login.ejs', {
    message: req.flash('loginMessage')
  });
}

function logout(req, res) {
  req.logout();
  res.redirect('/');
}

function profile(req, res) {
  res.render('../views/profile.ejs', {
    user: req.user // get the user out of session and pass to template
  });
}

function signup(req, res) {
  res.render('../views/signup.ejs', {
    message: req.flash('signupMessage')
  });
}

function local(req, res) {
  var user = req.user;
  user.local.email = undefined;
  user.local.password = undefined;
  user.save((err) => {
    if (err) { throw err; }
    res.redirect('/profile');
  });
}

function facebook(req, res) {
  var user = req.user;
  user.facebook.token = undefined;
  user.save((err) => {
    if (err) { throw err; }
    res.redirect('/profile');
  });
}

function google(req, res) {
  var user = req.user;
  user.google.token = undefined;
  user.save((err) => {
    if (err) { throw err; }
    res.redirect('/profile');
  });
}

function changeProfile(req, res) {
  res.render('../views/changeprofile.ejs', {
    user: req.user // get the user out of session and pass to template
  });
}

const User = require('../models/user.js');
function ranking(req, res) {
  const select = {
    "data": 1,
    "local.fname": 1,
    "local.lname": 1,
    "facebook.name": 1,
    "google.name": 1
  }
  User.find({}).select(select).sort({"data.score": -1}).exec((err, users) => {
    let rank = 0;
    let i = 0;
    for (i = 0; i < users.length; i++) {
      if (users[i].data.id === req.user.data.id) {
        rank = i;
        break;
      }
    }
    res.render('../views/Ranking.ejs', {
      user: req.user, // get the user out of session and pass to template
      sortedUsers: users,
      userRank: i
    });
  })
}

module.exports = {
  login,
  logout,
  signup,
  profile,
  unlink: {
    local,
    facebook,
    google
  },
  changeProfile,
  ranking
};
