const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.send('index.html'));

router.get('/welcome', forwardAuthenticated, (req, res) => res.render('welcome'));


// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    user: req.user,
    build: 'You are just few clicks away, start your project now!'
  })
);

module.exports = router;
