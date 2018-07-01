/* eslint-disable no-shadow */
const LocalStrategy = require('passport-local').Strategy;


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
            });
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
};
