var cryptoHelper = require('./../modules/crypto-helper')
	, mongoose = require('mongoose')
	, _ = require('lodash')
	, async = require('async');

User = mongoose.model('User');

UserModel = function(){};

UserModel.prototype.findOne = function(data, callback){
	User.findOne(data, function(err, user){
		if (err) callback(err);
		callback(null, user);
	})
};

UserModel.prototype.addUser = function(data, callback){
	cryptoHelper.saltAndHash(data.password, function(hash){
		User.create({
			username: data.username,
			password: hash,
			email: data.email
		}, function(err, user){
			if (err) callback('Error creating the user ' + err);
			else callback(null, user);
		});
	});
};

UserModel.prototype.listUsers = function(callback){	
	User.find(function(err, users){
		if (err) callback(error);
		else {
			if (users === null) callback(null, []);
			else {

				var m_users = [];
				async.each(users, function(user, eachCallback){
					m_users.push({ username : user.username, _id: user._id }) ;
					eachCallback();
				}, function(err){
					console.log("M_USERS " + JSON.stringify(m_users, null, 2));
					callback(null, m_users);					
				});
			}
		}
	});
};

UserModel.prototype.findUserByName = function(name, callback){
	User.findOne({username : name}, callback);
};

UserModel.prototype.followFriend = function(user_id, friend_id, callback){
	User.findById(user_id, function(err, user){
		user.profile.following.push

		var newIndex = user.profile.following.push(friend_id) - 1;

		user.save(function(err, user){
			if (err) callback(err);
			else {
				callback(null, user.profile.following);
			}
		});	
	});
};

UserModel.prototype.unfollowFriend = function(user_id, friend_id, callback){
	User.findById(user_id, function(err, user){
		user.profile.following.push

		var newIndex = user.profile.following.pull(friend_id) - 1;

		user.save(function(err, user){
			if (err) callback(err);
			else {
				callback(null, user.profile.following);
			}
		});	
	});
};

UserModel.prototype.listFollowing = function(user_id, callback){
	User.findById(user_id, function(err, user){
		if (err) callback(err);

		var f_users = [];
		async.each(user.profile.following, 
			function(following_id, eachCallback){
				User.findById(following_id, function(err, user){
					if(!err && user){
						console.log("F ID " + user);
						f_users.push({ username : user.username, _id: user._id }) ;
					}
					eachCallback();		
				});
			},
			function(err){

				console.log("F_USERS " + JSON.stringify(f_users, null, 2));

				callback(null, f_users);
			}
		);
	});
};

UserModel.prototype.listFBfriends = function(user_id, callback){

};


UserModel.prototype.User = User;



exports.UserModel = UserModel;