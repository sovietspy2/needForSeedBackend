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
const cors = require('cors');

const secret = 'mysecretsshhh';

const url = process.env.DB_CONNECTION;


const port = process.env.PORT || 1234;



let app = express();
app.use(cookieParser());
app.use(bodyParser.json()); // support json encoded bodies


app.use(morgan('dev'));


var whitelist = ['http://app.wortex.stream', 'http://app.wortex.stream:1234', 'http://localhost', '0.0.0.0']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  preflightContinue: true,
}

app.use('*',cors(corsOptions));



mongodb.MongoClient.connect(url, {useNewUrlParser: true}, (error, client) => {
    if (error) return process.exit(1);
    console.log('Connected to Database');

    const mongoMiddleware = function (req, res, next) {
        req.db = client.db("data");
        next();
    };


    

    app.use(mongoMiddleware);


    app.get('/home', routes.home);

    app.post('/api/register', routes.register);


      app.post('/api/authenticate', routes.authenticate);

    app.post('/logout', withAuth, routes.logout);

    app.get('/checkToken', withAuth, routes.checkToken);

    app.get('/api/lastPost', routes.lastPost);

    app.get('/api/nextPost', routes.nextPost);

    app.get('/api/previousPost', routes.previousPost);

    app.post('/api/checkUsername', routes.checkUsername);
    
    app.post('/api/savePost', routes.savePost);

    // The "catchall" handler: for any request that doesn't
    // match one above, send back React's index.html file.
    /* app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname+'/frontend/build/index.html'));
    });
 */

    app.use(errorHandler());
    app.listen(port);

});



