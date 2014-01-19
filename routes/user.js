
var UserModel = require('./../model/users').UserModel;


userModel = new UserModel();

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
							else res.redirect('/');
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
		res.redirect("/friends");
	});
};

exports.unfollowUser = function(req, res){
	userModel.unfollowFriend(req.user._id, req.param('unfollow_id'), function(err, following){
		res.redirect("/friends");
	});
};

exports.friends = function(req, res){
	userModel.listFollowing(req.user._id, function(err, following){
		res.render('following', {title: 'Following', users: following, isFollowingView: true });
	});
};

exports.feed = function(req, res){
	userModel.feed(req.user._id, function(err, results){
		res.render('index', {title: 'Home', movies:  results});
	});
};

exports.add_friends = function(req, res){
	userModel.listAddFriends(req.user._id, function(err, following){
		res.render('following', {title: 'Follow friends', users: following, isAddFriendsView: true });
	});
};