
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
  , MongoStore = require('connect-mongo')(express)
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
  process.env.PORT = 3001;
});

app.configure('production', function(){
  app.use(express.errorHandler());
  app.set('db-uri', process.env.MONGOHQ_URL);
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
  app.use(express.session({
    store: new MongoStore({
        url: app.set('db-uri')
      }),
        secret: 'topsecret'
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(function(req, res, next){
    if(req.isAuthenticated()){
      res.locals.username = req.user.username;
      res.locals.user_thumbnail = req.user.profile.profile_image_url;
    }
    next();
  });
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
app.get('/about', checkAuth, routes.about);
app.get('/signup', user.singupGet);
app.get('/login', user.loginGet);
app.get('/logout', user.logout);
app.get('/movieSearch', checkAuth, movie.searchMovie);
app.get('/watchedMovies', checkAuth, movie.watchedMovies);
app.get('/unwatchedMovies', checkAuth, movie.unwatchedMovies);
app.get('/auth/facebook', passport.authenticate('facebook', 
  {scope: ['email', 'user_friends'], callbackURL: '/auth/facebook/callback' }
));
app.get('/auth/facebook/callback', passport.authenticate('facebook', 
  { callbackURL: '/auth/facebook/callback', successRedirect: '/', failureRedirect: '/login' }
));


app.post('/login', auth);
app.post('/signup', user.signupPost);
app.post('/movie', checkAuth, movie.saveMovie);
app.post('/addWatchedMovie', checkAuth, movie.addWatchedMovie);
app.post('/addUnwatchedMovie', checkAuth, movie.addUnwatchedMovie);

var server = http.createServer(app)


var passportConfig = require('./modules/passportConfig')(require('os').hostname, app.get('port'));


server.listen(app.get('port'), function(err){
  console.log(err, server.address());
  console.log("Express server listening on port " + require('os').hostname());
});
