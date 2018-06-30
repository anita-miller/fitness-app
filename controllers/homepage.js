module.exports = (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/map');
  } else {
    res.render('../views/homepage.ejs');
  }
};
