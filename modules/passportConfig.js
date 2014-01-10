var mongoose = require('mongoose')
    , users = require('./../model/users')
    , passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy
    , FacebookStrategy = require('passport-facebook').Strategy;


module.exports = function(hostname, port) {
  return new PassportConfig(hostname, port);
}

function PassportConfig(hostname, port){

  address = null;
  address = 'http://'+hostname+":"+port;

  passport.serializeUser(function(user, done) {
    console.log("Serializing user " + user);
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    mongoose.model('User').findById(id, function(err, user) {
      done(err, user);
    });
  });

  User = mongoose.model('User');

  passport.use(new LocalStrategy(
    function(username, password, done) {
      users.findOne({ user: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        if (!user.validPassword(password)) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
      });
    }
  ));


  passport.use(new FacebookStrategy({
      clientID: '562771067124686',
      clientSecret: '19bb6fca7117a5b2f2723a6f5d7eed07',
      callbackURL: "http://tvmoviefq.herokuapp.com/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      User.findOne({ username: profile.username }, function(err, user) {
        if (err) { return done(err); }
        else {
          if (user) done(null, user);
          else {
            User.create({
              username : profile.username,
              email: profile.emails[0].value,
              fbId: profile.id,
              profile : {
                moviesUnwatched : [],
                moviesWatched : [],
                profile_image_url: 'http://graph.facebook.com/' + profile.id + '/picture?type=square'
              }
            }, function(err, user){
              if (err) return done(err);
              else done(null, user);
            });
          }
        }
      });
    })
  );
}



