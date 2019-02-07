const express = require('express');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const morgan = require('morgan');
const routes = require('./routes');
const cookieParser = require('cookie-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const withAuth = require('./middleware');
const mongodb = require('mongodb');
require('dotenv').config();
const User = require("./entities/user");
const CONSTANTS = require("./constants");

const secret = 'mysecretsshhh';

const url = process.env.DB_CONNECTION;


const port = process.env.PORT || 1234;



let app = express();
app.use(cookieParser());
app.use(bodyParser.json()); // support json encoded bodies


app.use(morgan('dev'));




mongodb.MongoClient.connect(url, {useNewUrlParser: true}, (error, client) => {
    if (error) return process.exit(1);
    console.log('Connected to Database');

    const mongoMiddleware = function (req, res, next) {
        req.db = client.db("data");
        next();
    };

    app.use(mongoMiddleware);


    app.get('/home', routes.home);

    app.get('/api/secret',withAuth, function(req, res) {
        res.send('The password is potato');
    });

    app.post('/api/register', function(req, res) {
        console.log(req.body.username)
        console.log(req.body.password);
        const {username, password} = req.body;
        const user = new User(username,password);
        req.db.collection("users").save(user, function(err) {
          if (err) {
            res.status(500)
              .send("Error registering new user please try again.");
          } else {
            res.status(200).send("Welcome to the club!");
          }
        });
      });


      app.post('/api/authenticate', function(req, res, next) {
        const { username, password } = req.body;
        console.log(username);
        req.db.collection(CONSTANTS.USERS).findOne({ username: username }, function(err, user) {
              if (err) console.log("elbaszodott");
              if (user) {
                console.log(user);
                  // Issue token

                  if (user.password === password) {

                  const payload = { username };
                  const token = jwt.sign(payload, secret, {
                    expiresIn: '1h'
                  });
                  //res.status(200).send();
                  res.cookie('token', token, { httpOnly: true }).sendStatus(200);
                } else {
                  res.status(403).send();
                }
            }
            
          });
    });

    app.post('/logout', withAuth, function(req,res) {
        console.log("LOGGING OUT");
        res.clearCookie("token").send();
    });

    app.get('/checkToken', withAuth, function(req, res) {
      console.log(req.body);
      res.sendStatus(200);
    });

    app.use(errorHandler());
    app.listen(port);

});



