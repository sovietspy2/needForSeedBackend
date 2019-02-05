const express = require('express');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const morgan = require('morgan');
const routes = require('./routes');

const port = process.env.PORT || 1234;

let app = express();
app.use(bodyParser.json()); // support json encoded bodies


app.use(morgan('dev'));
app.get('/home', routes.home);

app.use(errorHandler());

app.listen(port);