const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const _ = require('lodash');
  // Load User model
const User = require('../models/User');
const path = require('path');
require("dotenv").config();
const mongoose = require('mongoose');

// Everything Email Confirmation
const jwt = require('jsonwebtoken');

// Mail Gun
const mailgun = require("mailgun-js");
const mg = mailgun({apiKey: process.env.API_KEY, domain: process.env.DOMAIN});



// Functions For Export

module.exports = {
 
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/users/login');
  },

  forwardAuthenticated: function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/dashboard');      
  },

//POST SECTION


//Register Post Function

register: function (req, res) {
const {name, email, password, password2} = req.body;

// Initialization
 global.name      = name;
 global.email     = email;
 global.password  = password;
 global.password2 = password2;

  global.name;
  global.email;
  global.password; 
  global.password2;



  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
            //Check if Email Exists
         User.findOne({ email: email }).then(user => {
          if (user) {
            errors.push({ msg: 'User email already exists' });
            res.render('register', {
              errors,
              name,
              email,
              password,
              password2
            });
          }
           else {

            const newUser = new User({
              name,
              email,
              password
            });

              global.newUser;
              global.newUser = newUser;

            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;

                // Token Generate
                const token = jwt.sign({ name, email, password, password2 }, process.env.JWT_ACC_ACTIVATE,{expiresIn: '2min'});
              global.token = token;
              global.token;
         

         // Sending Email
        const data = {
        from: 'lexcorp@rojectzeus.com',
        to: email,
        subject: 'Account Activation Link',
        html: `
        <h2>Please click on the link below to activate your account</h2>
            <a href="${process.env.CLIENT_URL}/users/activate">
                  <p>Activate Account</p>
          </a>
        `
      };
      mg.messages().send(data, function (error, body) {
              if (error) {
                return res.json({
                  error: "Something went wrong, reload page"
                });
              } else {
                res.redirect('/users/confirmationpage');
              }
         });
          
        });
      });
            
    }
  });

  }
},






// Activation Post Funtion

activation: function (req, res){
  const {token} = req.body;
      if (token) {
            jwt.verify(token, process.env.JWT_ACC_ACTIVATE, function (err, decodedToken) {
              if (err) {
                console.log('error verifying');
                return res.status(400).json({err: "Invalid or Expired Link"});
              } else {
                  const { name, email, password, password2 } = decodedToken
                  newUser
                  .save()
                  .then(user => {
                    req.flash(
                      'success_msg',
                      'You are now registered and can log in'
                    );
                    res.redirect('/users/login');
              })
                }
                })
            }
                 else {
          return res.json({error:"Something went wrong, Please restart process!!!"});
              }   
       },


  // Forgotten Password
        forgortPassword: function (req, res){
          const {email} = req.body;

          console.log(email);

            User.findOne({email: email}, function (err, user) {
              if (err || !user) {
                    console.log('CANNOT VERIFY');
                    //err.push({ msg: 'This Email is not registered'});
                      res.redirect('register');
                    } 
                      // Generating Token
                  const token = jwt.sign({_id: user._id}, process.env.RESET_PASSWORD_KEY,{expiresIn: '20min'});
                  global.token = token;
                  global.token;


               // Sending Email
              const data = {
              from: 'lexcorp@rojectzeus.com',
              to: email,
              subject: 'Password Reset Link',
              html: `
                  <h2>Please click on the link below to reset your password.</h2>
                  <a href="${process.env.CLIENT_URL}/users/resetPassword">
                        <p>Reset Password</p>
                    </a>
                    `
              };
                    console.log('the resetLink about to be updated updated')
              return User.updateOne({ _id: user._id }, {resetLink: token}, function (err, success){
                    console.log('the resetLink updated')
                if (err) {
                        console.log('Password reset link invalid or expired')
                    err.push({ msg: 'Password reset link invalid or expired'});
                  } else{
                   mg.messages().send(data, function (error, body) {
              
                     if (error) {
                                  console.log('Something went wrong');
                            return res.json({error: "Something went wrong, reload page"});
                    }
                             console.log('Password reset link sent to your email, kindly follow the instruction');
                            return res.json({message:"Password reset link sent to your email"});
                           
                });
              }

            })
        })
      },


        // Reset Password
      resetPasswd: function(req, res){

        const {resetLink, newPasswd, newPasswd2} = req.body;


        console.log(resetLink, newPasswd, newPasswd2);

        if (resetLink) {
                   jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, function (err, decodedToken) {

                    console.log('VERIFIED TOKEN');
                    
                    if (err) {
                      res.send.json({msg:'Password reset token invalid or expired'});

                    } else {

                        User.findOne({resetLink: resetLink}, function(err, user) {
                          if (err || !user) {
                              console.log('CANNOT VERIFY');
                              //err.push({ msg: 'This Email is not registered'});
                              res.status(401).json({error: 'User with this token does not exit'});                              
                          } 


                              bcrypt.genSalt(10, (err, salt) => {
                              bcrypt.hash(newPasswd, salt, (err, hash) => {
                                if (err) throw err;

                              const obj = {
                                password: hash,
                                resetLink: ''
                              }

                            user = _.extend(user, obj);
                            user.save((err, result)=> {
                              
                          if (err) {
                        console.log('Password reset link invalid or expired')
                        //err.push({ msg: 'Password reset error'});
                    } else{
                         console.log('Password reset');
                         return res.json({message:"Your password has been changed!"});
                         
                          }

                        })

                            // then
                      }); 
                    });
                  })
               }

               })
                }

                else {
                    res.status(401).json({error: 'Authentication Error!'});
                  }        

            }



} //end of exports.........




 /*  User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'User email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      }

       else {
        const newUser = new User({
          name,
          email,
          password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
*/




