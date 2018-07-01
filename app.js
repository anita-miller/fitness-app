// The 'main' file. Oversees all parts of the app.

// REQUIRES
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const MongoStore = require('connect-mongo')(session);
const redirectToHTTPS = require('express-http-to-https').redirectToHTTPS;

require('./config/passport.js')(passport); // Configure passport


const PORT = process.env.PORT || 80;

// CONFIG
mongoose.connect(process.env.MONGODB_URI);

app.use(redirectToHTTPS()); // Make sure the content is server over https
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'views')));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use(session({
  secret: process.env.passportSecret,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }) // To store session data
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// ROUTES
require('./routes/routes.js')(app); // Routes homepage/map/cache
require('./routes/authenticationRoutes.js')(app, passport); // All routes to do with auth

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`); // Good to go!
});
