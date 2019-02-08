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

    app.post('/api/register', routes.register);


      app.post('/api/authenticate', routes.authenticate);

    app.post('/logout', withAuth, routes.logout);

    app.get('/checkToken', withAuth, routes.checkToken);

    app.use(errorHandler());
    app.listen(port);

});



