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

		var newIndex = user.profile.following.push({user_following : friend_id}) - 1;

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

		var friend = _.find(user.profile.following, function(f_user){
			return f_user.user_following.equals(mongoose.Types.ObjectId(friend_id.toString()));
		});
		var newIndex = user.profile.following.pull(friend) - 1;	

		user.save(function(err, user){
			if (err) callback(err);
			callback(null, user.profile.following);
		});
	});
};

UserModel.prototype.listFollowing = function(user_id, callback){
	User.findById(user_id).populate('profile.following.user_following', 'username _id').exec(function(err, user){
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
								return user_d.user_following.equals(follow_user._id)
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


UserModel.prototype.feed = function(user_id, callback){

	User.findById(user_id).populate(
		'profile.following.user_following', 
		'username _id profile.moviesUnwatched profile.moviesWatched'
		).exec(function(err, user){
		
		if (err) callback(err);

		var results = [];

		async.each(
			user.profile.following, 
			function(follow, asyncCallback){
				async.each(follow.user_following.profile.moviesUnwatched,
					function(movie_f, asyncCallback2){						
						results.push({
							username: follow.user_following.username,
							movie: movie_f.title,
							movie_id: movie_f._id,
							type: 'movieUnwatched',
							created: movie_f.created
						});						
					},

					function(err){
						if (err) asyncCallback(err)
						asyncCallback();
					}
				);
				async.each(follow.user_following.profile.moviesWatched,
					function(movie_f, asyncCallback3){						
						results.push({
							username: follow.user_following.username,
							movie: movie_f.title,
							movie_id: movie_f._id,
							type: 'movieWatched',
							created: movie_f.created
						});
						asyncCallback3();
					},

					function(err){
						if (err) asyncCallback2(err)
						asyncCallback();
					}
				);
			}
			,
			function(err){
				if(err) callback(err);

				var resultsSorted = _.sortBy(results, function(res){
					return -1 * res.created;
				});
				console.log("FOOLLOWING " + JSON.stringify(resultsSorted, null, 2));
				callback(null, resultsSorted);
			}
		);
		
	});
}

UserModel.prototype.listFBfriends = function(user_id, callback){

};


UserModel.prototype.User = User;



exports.UserModel = UserModel;