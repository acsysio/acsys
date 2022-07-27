/* eslint-disable no-unused-vars */
/* eslint-disable no-path-concat */
/* eslint-disable prefer-template */
/* eslint-disable prettier/prettier */
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');

const jwt = require('./jwt');

const index = require('./routes/index');

const app = express();

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'build')));
app.use('/favicon.ico', express.static('public/acsys-icon.svg'));

// configure jwt
app.use(jwt());

app.use(fileUpload());

// configure cors
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use('/api', index);
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/build/index.html'));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // forward all errors to react app
  res.status(err.status || 500);
  res.sendFile(path.join(__dirname + '/build/index.html'));
});

// allow application to recognize secure protocols
app.enable('trust proxy');

module.exports = app;
