const router = require('express').Router();
let User = require('../models/user.model');

router.route('/register').post((req, res) => {
  const { username, email, password } = req.body;

  const newUser = new User({
    username,
    email,
    password,
  });

  newUser.save()
    .then(() => res.json('User registered!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/login').post((req, res) => {
  // This is a placeholder for the login functionality.
  res.json('Login successful!');
});

module.exports = router;