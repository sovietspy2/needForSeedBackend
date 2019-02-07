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

const secret = 'mysecretsshhh';

const url = process.env.DB_CONNECTION;


const port = process.env.PORT || 1234;



let app = express();
app.use(cookieParser());
app.use(bodyParser.json()); // support json encoded bodies


app.use(morgan('dev'));
app.use(errorHandler());



mongodb.MongoClient.connect(url, {useNewUrlParser: true}, (error, client) => {
    if (error) return process.exit(1);
    console.log('Connected to Database');

    const mongoMiddleware = function (req, res, next) {
        req.db = client.db("data");
        next();
    };

    app.use(mongoMiddleware);


    app.get('/home', routes.home);

    app.get('/api/secret', function(req, res) {
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


    
    app.listen(port);

});



