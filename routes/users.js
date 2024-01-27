const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
  // Load User model
const User = require('../models/User');
const {ensureAuthenticated, forwardAuthenticated, register, activation, forgortPassword, resetPasswd} = require('../config/auth');
const path = require('path');
require("dotenv").config();

// Everything Email Confirmation
const jwt = require('jsonwebtoken');

// Mail Gun
const mailgun = require("mailgun-js");
const mg = mailgun({apiKey: process.env.API_KEY, domain: process.env.DOMAIN});



// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));


// Register Page - Get
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'
  ));


// Register Page - Post
router.post('/register', register);

  
// Confirmation Page
router.get('/confirmationpage', forwardAuthenticated, (req, res) => 
  res.render('confirmationpage')
  );


// Activation Page Get
router.get('/activate', forwardAuthenticated, (req, res) => {res.render('activate')
});


 // Activation Page - POST
router.post('/activate', activation);




// Login - Post
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  }) (req, res, next);
});




// Logout - Get
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});




// Contact Page
router.get('/contact', (req, res) => 
  res.render('contact')
  );




// Order Page
router.get('/orderPage',ensureAuthenticated, (req, res) => 
  res.render('orderPage')
  );




// About Page
router.get('/about', (req, res) => 
  res.render('about')
  );



// Help Page
router.get('/help', (req, res) => 
  res.render('help')
  );



// Forgotten Password Page
router.get('/forgottenPas', forwardAuthenticated,
  (req, res) =>{ 
  res.render('forgottenPas')
});

// Forgotten Password Page
router.post('/forgottenPas', forgortPassword);



// Forgotten Password Page
router.get('/resetPassword', forwardAuthenticated,
  (req, res) =>{ 
  res.render('resetPassword')
});

router.post('/resetPassword', resetPasswd);

module.exports = router;