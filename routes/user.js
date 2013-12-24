
var mongoose = require('mongoose')
	, users = require('./../model/users')
  	, passport = require('passport')
  	, LocalStrategy = require('passport-local').Strategy;


passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  mongoose.model('User').findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy({
		usernameField: 'user'
	},
  function(username, password, done) {
  	console.log('validating ' + username);
    users.findOne({ user: username }, function (err, user) {
  		console.log('found');
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


exports.loginGet = function(req, res){
	res.render('login', {});
};

exports.loginPost = function(req, res){
	var user = req.body.user;
	var password = req.body.password;

	users.User.findOne({ user: user }, function (err, user) {
    	console.log('validating');
      if (err) { return done(err); }
      if (!user) {
        res.redirect('/login');
      }
      else{
      	var isValid = null;
      	user.validPassword(password, function(err, isValid){
      		if (!isValid){
		      res.redirect('/login');
      		}
      		else{
		      req.session.user_id = user._id;
		      res.redirect('/');
      		}
      	});	
      }
    });
};

exports.logout = function(req, res){
	req.logout();
	res.redirect('/login');
}

exports.singupGet = function(req, res){
	res.render('singup', {});
};

exports.signupPost = function(req, res){
	users.addUser({
		user: req.param('user'),
		email: req.param('email'),
		password: req.param('password')
	}, function(err, user){
		if (err) throw err;
		else{
			req.login(user, function(err){
				if(err) throw err;
				else res.redirect('/');
			});
		}
	});
};