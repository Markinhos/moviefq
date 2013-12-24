
/**
 * Module dependencies.
 */

var express = require('express')
  , db = require('./model/db')
  , routes = require('./routes/index')
  , user = require('./routes/user')
  , movie = require('./routes/movie')
  , http = require('http')  
  , mongoose = require('mongoose')
  , mongoStore = require('connect-mongodb')
  , path = require('path')
  , passport = require('passport');

var app = express();


app.configure('development', function(){
  app.use(express.errorHandler());
  app.set('db-uri', 'mongodb://localhost/moviefq');
});

app.configure('test', function() {
  app.set('db-uri', 'mongodb://localhost/moviefq-test');
  app.set('view options', {
    pretty: true
  });  
});

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ store: mongoStore(app.set('db-uri')), secret: 'topsecret' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});


mongoose.connect(app.set('db-uri'));

var auth = passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login'});

function checkAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/login');
  } else {
    next();
  }
}

app.get('/', checkAuth, routes.index);
app.get('/signup', user.singupGet);
app.get('/login', user.loginGet);
app.get('/logout', user.logout);
app.get('/movieSearch', movie.searchMovie);


app.post('/login', auth);
app.post('/signup', user.signupPost);
app.post('/movie', movie.saveMovie);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
