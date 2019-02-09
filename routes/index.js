const uuid = require('uuid/v1');
const mongodb = require('mongodb');
const CONSTANTS = require("../constants");
const jwt = require('jsonwebtoken');
const User = require("../entities/user");
const bcrypt = require('bcrypt');
const saltRounds = 10;

const secret = 'mysecretsshhh';

module.exports = {
    home(req, res, next) {
        console.log(req.db);
        res.status(200).send("hello");
    },

    test(req, res, next) {
        
    },

    checkToken(req, res) {
        console.log(req.body);
        res.sendStatus(200);
      },
    
      logout(req,res) {
        console.log("LOGGING OUT");
        res.clearCookie("token").send();
    },

    authenticate(req, res, next) {
        const { username, password } = req.body;
        console.log(username);
        req.db.collection(CONSTANTS.USERS).findOne({ username: username }, function(err, user) {
              if (err) console.log("elbaszodott");
              if (user) {
                console.log(user);
                console.log(user.password, password);
                bcrypt.compare(password, user.password,function(err, hashStatus) {
                  if (err) res.status(500).send();
                  console.log("RES IS:",hashStatus);
                  if (hashStatus) {
                    const payload = { username };
                    const token = jwt.sign(payload, secret, {
                      expiresIn: '1h'
                    });
                    //res.status(200).send();
                    res.cookie('token', token, { httpOnly: true }).sendStatus(200);
                  } else {
                    res.status(403).send();
                  }
              });
            }
            
          });
    },

    register(req, res) {
        console.log(req.body.username)
        console.log(req.body.password);
        const {username, password} = req.body;
        const user = new User(username,password);

        bcrypt.hash(user.password, saltRounds, function(err, hash) {
          user.password = hash;
          req.db.collection("users").save(user, function(err) {
            if (err) {
              res.status(500).send("Error registering new user please try again.");
            } else {
              res.status(200).send("Welcome to the club!");
            }
          });
        }); 
      },

      lastPost(req,res) {
        req.db.collection(CONSTANTS.POSTS).find({}, {sort:{_id:-1}})
        .limit(1)
        .toArray((error, record)=>{
            if (error) return next(error);
            res.status(200).send(record);
        });
      },

      nextPost(req,res) {
        console.log(req.query);
        const id = req.query.id;
        console.log(id);
        req.db.collection(CONSTANTS.POSTS).find({ '_id': {'$lt': mongodb.ObjectID(id) }}, {sort:{_id:-1}})
        .limit(1)
        .toArray((error, record)=>{
            if (error) return next(error);
            console.log(record);
            res.status(200).send(record);
        });
      },

      previousPost(req,res) {
        console.log(req.query);
        const id = req.query.id;
        console.log(id);
        req.db.collection(CONSTANTS.POSTS).find({ '_id': {'$gt': mongodb.ObjectID(id) }}, {sort:{_id:1}})
        .limit(1)
        .toArray((error, record)=>{
            if (error) return next(error);
            console.log(record);
            res.status(200).send(record);
        });
      },
};
