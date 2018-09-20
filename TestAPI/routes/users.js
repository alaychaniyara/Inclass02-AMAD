const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt =  require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAuth = require('../auth/check-auth');

const User = require('../models/user');
const Survey = require('../models/survey');


router.post('/signUp', (req, res, next) => {
    console.log(req.body);
    User.find({email: req.body.email})
        .exec()
        .then(user => {
            if(user.length >= 1){
                console.log('Getting into if....');
                return res.status(409).json({
                    message: 'Mail exists'
                });
            }else{
                console.log('Getting into else....');
                console.log(req.body.password);
                bcrypt.hash(req.body.password,10,(err,hash) => {
                    if(err){
                        console.log("error in bcrypt");
                        return res.status(500).json({error:err});
                    }else{
                        console.log(" no error in bcrypt");
                        const user = new User({
                           _id: mongoose.Types.ObjectId(),
                           email:req.body.email,
                           password:hash
                        });
                        user.save().then(result => {
                            res.status(201).json({
                                message:'User Created',
                                User: {
                                    id: result._id,
                                    email: result.email,
                                    password: result.password
                                }
                            })
                        }).catch(err => {
                            console.log(err);
                            res.status(500).json({
                               error:err
                            });
                        });
                    }
                });
            }
        })
        .catch(err => {
            message: 'Error creating user';
        });
});

router.get('/userSurveys', (req,res,next)=>{
    Survey.find()
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({result});
        })
        .catch(err=>{
           console.log(err);
           res.status(500).json({
              message: 'Error retrieving surveys',
              error:err
           });
        });
});

router.get('/allUsers', (req,res,next) => {
    User.find()
        .exec()
        .then(result => {
            console.log(result);
            // res.write(result);
            res.status(200).json({result});
        })
        .catch(err => {
           res.status(500).json({
               message:'error',
               error:err
           })
        });
});

router.get('/:userName', checkAuth, (req,res,next) => {
   const userName = req.body.email;
   User.findById(username)
       .select('_id name')
       .exec()
       .then(docs => {
           console.log(docs);
           res.status(200).json({
              message: 'Success',
              userName: docs.email,
              userId: docs._id
           });
       })
       .catch(err => {
          console.log(err);
          res.status(500).json(err);
       });
});

router.post('/login', (req,res,next) => {
   User.find({email: req.body.email})
    .exec()
        .then(user => {
          if(user.length < 1){
              console.log(user);
              //means didnt get a user
              return res.status(404).json({//Unauthorized...
                  message: 'AUTHORIZATION FAILED'
              });
          }
          //IF EMAIL ID MATCHES, NEXT STEP HASH THE PASSWORD AND CHECK IF EQUAL
            bcrypt.compare(req.body.password,user[0].password,(err,result) => {
                if(err){
                    return res.status(401).json({
                        message: 'Auth failed'
                    });
                }
                if(result){
                    const token = jwt.sign({
                        email: user[0].email,
                        id: user[0]._id
                    },process.env.JWT_KEY,{expiresIn:"1day"});
                    return res.status(200).json({
                        message: 'Authentication success',
                        token: token
                    });
                }else{
                    return res.status(401).json({
                        message: 'Auth failed'
                    });
                }
            });
        })
        .catch(err => {
            console.log('Error in login module')
            res.status(500).json({
                message : 'Error logged',
                error:err
            });
        });
});

router.delete('/:userId', (req,res,next) => {
   User.remove({_id:req.params.userId}).exec()
       .then(result => {
           res.status(200).json({
               message:'User deleted'
           });
       })
       .catch(err => {
           console.log(err);
           res.status(500).json({
              error:err
           });
       });
});

router.post('/addSurvey',  (req,res,next) => {
    console.log(req.body.email);
    const userSurvey = new Survey({
        _id: mongoose.Types.ObjectId(),
        email: req.body.email,
        answer1: req.body.answer1,
        answer2: req.body.answer2,
        answer3: req.body.answer3,
        answer4: req.body.answer4,
        answer5: req.body.answer5,
        answer6: req.body.answer6,
        answer7: req.body.answer7,
        answer8: req.body.answer8,
        answer9: req.body.answer9,
        answer10: req.body.answer10,
        totalScore : req.body.totalScore,
        riskLevel : req.body.riskLevel
    });
    return userSurvey.save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message : 'User Survey recorded',
                surveyResults: {
                    totalScore: result.totalScore,
                    riskLevel: result.riskLevel
                }
            });
        }).catch(err => {
            res.status(400).json({
                error:err
            });
        });
});

module.exports = router;
