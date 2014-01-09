
var mongoose = require('mongoose')
	 ,users = require('./../model/users');


User = mongoose.model('User')
exports.loginGet = function(req, res){
	res.render('login', {});
};

exports.loginPost = function(req, res){
	var username = req.body.username;
	var password = req.body.password;

	User.findOne({ username: username }, function (err, user) {
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
	User.findOne({username : req.body.username}, function(err, user){
		if (err) console.log(err);
		else {
		  if(user) res.redirect('/signup');
		  else {
			User.findOne({email: req.body.email}, function(err, user){
				users.addUser({
						username: req.body.username,
						email: req.body.email,
						password: req.body.password
					}, function(err, user){
					if (err) throw err;
					else{
						req.login(user, function(err){
							if(err) throw err;
							else res.redirect('/');
						});
					}
				});
			});
		  }
		}
  });
};