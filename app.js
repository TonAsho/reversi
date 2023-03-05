var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require("express-session");
var map = require("sitemap-generator");

var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var subscribeRouter = require('./routes/subscribe');
var mypageRouter = require('./routes/mypage');
var logoutRouter = require('./routes/logout');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'secret_key',
  resave: false,
  saveUninitialized: false
}));

app.use(function(req, res, next) {
  res.locals.username = req.session.username;
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})
app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/subscribe', subscribeRouter);
app.use('/mypage', mypageRouter);
app.use('/logout', logoutRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// option
const option = {lastMod: true};
 
// create generator
const generator = map("https://ramothello.up.railway.app/", option);
 
// register event listeners
generator.on("done", () => {
  // sitemaps created
});
 
// start the crawler
generator.start();

module.exports = app;
