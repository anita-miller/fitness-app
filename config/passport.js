const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;


const User = require('../models/user.js');

module.exports = function configuredPassport(passport) {
  // Session set up
  passport.serializeUser((user, done) =>{
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });


  /** *************************************************************************
  ================================================================================

  Local passport Routes

  ================================================================================
  *************************************************************************** */


  passport.use('local-signup', new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    (req, email, password, done) => {
    // asynchronous
      process.nextTick(() => {
        User.findOne({ 'local.email': email }, (err, existingUser) => {
        // if there are any errors, return the error
          if (err) { return done(err); }

          if (existingUser) {
            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
          }

          //  If we're logged in, we're connecting a new local account.
          if (req.user) {
            const user = req.user;
            user.local.email = email;
            user.local.password = user.generateHash(password);
            user.local.fname = req.body.fname;
            user.local.lname = req.body.lname;
            user.save((err2) => {
              if (err2) { throw err2; }
              return done(null, user);
            });
          } else { //  We're not logged in, so we're creating a brand new user.
          // create the user
            const newUser = new User();

            newUser.local.email = email;
            newUser.local.password = newUser.generateHash(password);
            newUser.local.fname = req.body.fname;
            newUser.local.lname = req.body.lname;
            User.count({}, (err, count) => {
              newUser.data.id = count;
              newUser.save((err3) => {
                if (err3) { throw err3; }

                return done(null, newUser);
              });
            })
          }
        });
      });
    }
  ));

  passport.use('local-login', new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    (req, email, password, done) => {
    // asynchronous
      process.nextTick(() => {
        User.findOne({ 'local.email': email }, (err, user) => {
        // if there are any errors, return the error
          if (err) { return done(err); }

          // if no user is found, return the message
          if (!user) { return done(null, false, req.flash('loginMessage', 'No user found.')); }

          if (!user.isCorrectPassword(password)) { return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); }

          // all is well, return user
          return done(null, user);
        });
      });
    }
  ));
  passport.use('local-changeprofile', new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    (req, email, password, done) => {
    // asynchronous
      process.nextTick(() => {
        User.findOne({ 'local.email': email }, (err, existingUser) => {
        // if there are any errors, return the error
          if (err) { return done(err); }

          if (existingUser) {
            return done(null, false, req.flash('changeprofile', 'That email is already taken.'));
          }

          //  If we're logged in, we're connecting a new local account.
          if (req.user) {
            const user = req.user;
            user.local.email = email;
            user.local.password = user.generateHash(password);
            user.local.fname = req.body.fname;
            user.local.lname = req.body.lname;
            user.save((err2) => {
              if (err2) { throw err2; }
              return done(null, user);
            });
          } else { //  We're not logged in, so we're creating a brand new user.
            // create the user
            const newUser = new User();

            newUser.local.email = email;
            newUser.local.password = newUser.generateHash(password);
            newUser.local.fname = req.body.fname;
            newUser.local.lname = req.body.lname;
            newUser.save((err3) => {
              if (err3) { throw err3; }

              return done(null, newUser);
            });
          }
        });
      });
    }
  ));

  /** *************************************************************************
  ================================================================================

  Facebook passport Routes

  ================================================================================
  *************************************************************************** */

  passport.use(new FacebookStrategy(
    {

      clientID: process.env.facebookClientID,
      clientSecret: process.env.facebookClientSecret,
      callbackURL: process.env.facebookcallbackURL,
      passReqToCallback: true

    },
    (req, token, refreshToken, profile, done) => {
    // asynchronous
      process.nextTick(() => {
      // check if the user is already logged in
        if (!req.user) {
          User.findOne({ 'facebook.id': profile.id }, (err, user) => {
            if (err) { return done(err); }

            if (user) {
            // (user was linked at one point and then removed)
              if (!user.facebook.token) {
                user.facebook.token = token;
                user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                user.facebook.email = profile.emails.value;

                user.save((err2) => {
                  if (err2) { throw err2; }
                  return done(null, user);
                });
              }

              return done(null, user); // user found, return that user
            }
            // if there is no user, create them
            const newUser = new User();

            newUser.facebook.id = profile.id;
            newUser.facebook.token = token;
            newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
            newUser.facebook.email = profile.emails;

            User.count({}, (err, count) => {
              newUser.data.id = count;
              newUser.save((err3) => {
                if (err3) { throw err3; }

                return done(null, newUser);
              });
            })
          });
        } else {
        // user already exists and is logged in, we have to link accounts
          const user = req.user; // pull the user out of the session

          user.facebook.id = profile.id;
          user.facebook.token = token;
          user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
          user.facebook.email = profile.emails;

          user.save((err) => {
            if (err) { throw err; }
            return done(null, user);
          });
        }
      });
    }
  ));

  /** *************************************************************************
  ================================================================================

  Google passport Routes

  ================================================================================
  *************************************************************************** */

  passport.use(new GoogleStrategy(
    {

      clientID: process.env.googleClientID,
      clientSecret: process.env.googleClientSecret,
      callbackURL: process.env.googlecallbackURL,
      passReqToCallback: true

    },
    (req, token, refreshToken, profile, done) => {
    // asynchronous
      process.nextTick(() => {
      // check if the user is already logged in
        if (!req.user) {
          User.findOne({ 'google.id': profile.id }, (err, user) => {
            if (err) { return done(err); }

            if (user) {
            // (user was linked at one point and then removed)
              if (!user.google.token) {
                user.google.token = token;
                user.google.name = profile.displayName;
                user.google.email = profile.emails.value;

                user.save((err2) => {
                  if (err2) { throw err2; }
                  return done(null, user);
                });
              }

              return done(null, user);
            }
            const newUser = new User();

            newUser.google.id = profile.id;
            newUser.google.token = token;
            newUser.google.name = profile.displayName;
            newUser.google.email = profile.emails.value;

            User.count({}, (err, count) => {
              newUser.data.id = count;
              newUser.save((err3) => {
                if (err3) { throw err3; }

                return done(null, newUser);
              });
            })
          });
        } else {
          const user = req.user;
          // user already exists AND logged in, link accounts

          user.google.id = profile.id;
          user.google.token = token;
          user.google.name = profile.displayName;
          user.google.email = profile.emails.value;

          user.save((err) => {
            if (err) { throw err; }
            return done(null, user);
          });
        }
      });
    }
  ));
};
