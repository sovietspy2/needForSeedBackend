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
            const data = module.exports.calculateLikes(record);
            res.status(200).send(data);
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
            const data = module.exports.calculateLikes(record);
            res.status(200).send(data);
        });
      },

      loadPost(req,res) {
        const { _id } = req.body;
        console.log(_id);

        if (!mongodb.ObjectID.isValid(_id)) {
            res.status(404).send();
        }
        req.db.collection(CONSTANTS.POSTS).findOne({ '_id': mongodb.ObjectID(_id) },
        function(error, record) {
            if (error) return next(error);
            console.log(record);
            const data = module.exports.calculateLikesSingleRecord(record);
            console.log(data);
            res.status(200).send(data);
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
            const data = module.exports.calculateLikes(record);
            res.status(200).send(data);
        });
      },

      calculateLikes(record) {
        let data = null;        
        if (record.length===1) {
          data = record[0];
          data.likes = data.likes ? data.likes.length : 0;
        }
        return data;
      },

      calculateLikesSingleRecord(record) {
        record.likes = record.likes ? record.likes.length : 0;
        return record;
      },

      checkUsername(req,res) {
        const { username } = req.body;
        console.log("USERNAME",username);
        req.db.collection(CONSTANTS.USERS).find({ 'username': username }, {})
        .limit(1)
        .toArray((error, record)=>{
            if (error) return next(error);
            console.log(record);
            const user = record[0];
            console.log(user);
             if ( user===undefined || record===[] || (user && !user.username)) {
              res.status(200).send();
             } else {
              res.status(409).send();
             }
            
        });
      },

      savePost(req, res) {
          const {payload} = req.body;
          console.log(payload);
          req.db.collection(CONSTANTS.POSTS).insertOne(payload);
          res.status(200).send();
      },

      likePost(req,res) {
        console.log(req.body);
        const {_id, username} = req.body;
        console.log(_id);
        req.db.collection(CONSTANTS.POSTS).updateOne({_id:mongodb.ObjectID(_id)}, {$addToSet:{likes: username}});
        res.status(200).send();
      },

      saveComment(req, res) {
        const {payload} = req.body;
        

        const comment = {
          text: payload.text,
          username: payload.username,
          date: payload.date,
        }

        req.db.collection(CONSTANTS.POSTS).updateOne({_id:mongodb.ObjectID(payload.id)}, {$push:{comments: comment}});
        res.status(200).send();
    },

    loadComments(req, res) { 
      const { _id } = req.body;
      req.db.collection(CONSTANTS.POSTS).findOne({ '_id': mongodb.ObjectID(_id)}, { "projection": {"comments": 1 }},
      function(error, record) {
        if (error) return next(error);
        console.log(record);
        res.status(200).send(record.comments);

    });
    }
};
