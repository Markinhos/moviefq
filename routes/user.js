
var UserModel = require('./../model/users').UserModel
	, sendgrid  = require('sendgrid')(
	  process.env.SENDGRID_USERNAME,
	  process.env.SENDGRID_PASSWORD
	),
	ActivationModel = require('./../model/activations').ActivationModel ;


userModel = new UserModel();
activationModel = new ActivationModel();

exports.loginGet = function(req, res){
	res.render('login', {});
};

exports.logout = function(req, res){
	req.logout();
	res.redirect('/login');
}

exports.singupGet = function(req, res){
	res.render('singup', {});
};

exports.signupPost = function(req, res){
	userModel.User.findOne({username : req.body.username}, function(err, user){
		if (err) console.log(err);
		else {
		  if(user) res.redirect('/signup');
		  else {
			userModel.User.findOne({email: req.body.email}, function(err, user){
				if(user) res.redirect('/signup');
				userModel.addUser({
						username: req.body.username,
						name: req.body.username,
						email: req.body.email,
						password: req.body.password
					}, function(err, user){
					if (err) throw err;
					else{
						req.login(user, function(err){
							if(err) throw err;
							activationModel.addActivation(req.body.email, function(err, activation){

								sendgrid.send({
									  	to: req.body.email,
									  	from: "no-replay@tvmoviefq.com",
									  	subject: 'Welcome to TvMovieFQ',
									  	html: 'Welcome to TvMovieFQ!\nPlease confirm your account ' +
									  	'<a href="http://' + req.headers.host + '/email-activation/' 
									  	+ activation._id +'">here</a>'
									}, 
									function(err, json) {
										if (err) { return console.error(err); }

									  	console.log(json);
								  		res.redirect('/');
									}
								);
							});
						});
					}
				});
			});
		  }
		}
  });
};

exports.followUser = function(req, res){
	userModel.followFriend(req.user._id, req.param('follow_id'), function(err, following){
		if(err) console.log(err);
		res.redirect("/friends");
	});
};

exports.unfollowUser = function(req, res){
	userModel.unfollowFriend(req.user._id, req.param('unfollow_id'), function(err, following){
		if(err) console.log(err);
		res.redirect("/friends");
	});
};

exports.friends = function(req, res){
	userModel.listFollowing(req.user._id, function(err, following){
		if(err) console.log(err);
		res.render('following', {title: 'Following', users: following, isFollowingView: true });
	});
};

exports.settings = function(req, res){
	userModel.findOne({_id: req.user._id}, function(err, user){
		if(err) console.log(err);
		res.render('settings', {title: 'Settings', user: user});
	});
};

exports.feed = function(req, res){
	userModel.feed(req.user._id, function(err, results){
		if(err) console.log(err);
		res.render('index', {title: 'Home', movies:  results});
	});
};

exports.uploadPhoto = function(req, res){
	userModel.uploadPhoto(req.user._id, req.files, function(err, modified_user){
		if(err) console.log(err);
		res.redirect("/settings");
	});
};

exports.modifySettings = function(req, res){
	userModel.modifyData(req.user._id, req.param('display_name'), req.param('email'), function(err, modified_user){
		if(err) console.log(err);
		res.redirect("/settings");
	});
};

exports.add_friends = function(req, res){
	userModel.listAddFriends(req.user._id, function(err, following){
		if(err) console.log(err);
		res.render('following', {title: 'Follow friends', users: following, isAddFriendsView: true });
	});
};

exports.activateEmail = function(req, res){
	activationModel.verify(req.params.id, req.user, function(err, data){
		if(err) console.log(err);
		res.redirect('/');
	});
};