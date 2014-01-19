
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
  , passport = require('passport')
  , Facebook = require('facebook-node-sdk');;

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
  app.use(Facebook.middleware({ appId: '562771067124686', secret: '19bb6fca7117a5b2f2723a6f5d7eed07' }));
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});


mongoose.connect(app.set('db-uri'));

var auth = passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login'});

function checkAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    console.log("User not authenticated");
    res.redirect('/login');
  } else {
    next();
  }
}


app.get('/', checkAuth, user.feed);
app.get('/about', checkAuth, routes.about);
app.get('/signup', user.singupGet);
app.get('/login', user.loginGet);
app.get('/logout', user.logout);
app.get('/friends', checkAuth, user.friends);
app.get('/user/:userId', checkAuth, movie.getMoviesUser);
app.get('/follow-friends', checkAuth, user.add_friends);
app.get('/watched-movies/tag/:tagName', checkAuth, movie.listWatchedTagMovies);
app.get('/unwatched-movies/tag/:tagName', checkAuth, movie.listUnwatchedTagMovies);
app.get('/movieSearch', checkAuth, movie.searchMovie);
app.get('/watchedMovies', checkAuth, movie.watchedMovies);
app.get('/unwatchedMovies', checkAuth, movie.unwatchedMovies);
app.get('/auth/facebook', passport.authenticate('facebook', 
  {scope: ['email', 'user_friends'], callbackURL: '/auth/facebook/callback' }
));
app.get('/auth/facebook/callback', passport.authenticate('facebook', 
  { callbackURL: '/auth/facebook/callback', successRedirect: '/', failureRedirect: '/login' }
));
app.get('/facebook', Facebook.loginRequired(), function (req, res) {
  req.facebook.api('/me', function(err, users) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello, ' + JSON.stringify(users, null, 2));
  });
});

app.post('/login', auth);
app.post('/signup', user.signupPost);
app.post('/followUser', checkAuth, user.followUser);
app.post('/unfollowUser', checkAuth, user.unfollowUser);
app.post('/addWatchedMovie', checkAuth, movie.addWatchedMovie);
app.post('/addUnwatchedMovie', checkAuth, movie.addUnwatchedMovie);
app.post('/deleteWatchedMovie', checkAuth, movie.deleteWatchedMovie);


var server = http.createServer(app)


var passportConfig = require('./modules/passportConfig')(require('os').hostname, app.get('port'));


server.listen(app.get('port'), function(err){
  console.log(err, server.address());
  console.log("Express server listening on port " + require('os').hostname());
});
