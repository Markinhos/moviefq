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
	User.find({}, 'username _id').exec(callback);
};

UserModel.prototype.findUserByName = function(name, callback){
	User.findOne({username : name}, callback);
};

UserModel.prototype.followFriend = function(user_id, friend_id, callback){
	User.findById(user_id, function(err, user){

		var newIndex = user.profile.following.push(friend_id) - 1;

		user.save(function(err, user){
			if (err) {
				console.log("Error " + err);
				callback(err);
			}
			callback(null, user.profile.following);
		});	
	});
};

UserModel.prototype.unfollowFriend = function(user_id, friend_id, callback){
	User.findById(user_id, function(err, user){
		user.profile.following.push

		var newIndex = user.profile.following.pull(friend_id) - 1;

		user.save(function(err, user){
			if (err) callback(err);
			
			callback(null, user.profile.following);
		});	
	});
};

UserModel.prototype.listFollowing = function(user_id, callback){
	User.findById(user_id).populate('profile.following', 'username _id').exec(function(err, user){
		if (err) callback(err);
		callback(null, user.profile.following);
	});
};

UserModel.prototype.listAddFriends = function(user_id, callback){
	var self = this;
	User.findById(user_id, function(err, user){
		if(err) callback(err);

		self.listUsers(function(err, followList){
			if(err) callback(err);
			async.filter (followList, 
				function (follow_user, asyncCallback){				
					asyncCallback(
						//If user is not himself
						!(user_id.equals(follow_user._id) 
							//And is not already following him
						|| user.profile.following.some(function(user_d){
								return user_d.equals(follow_user._id)
							}
						))
					);
				},
				function(results){
					callback(null, results);
				}
			);

		});
	});
};

UserModel.prototype.listFBfriends = function(user_id, callback){

};


UserModel.prototype.User = User;



exports.UserModel = UserModel;