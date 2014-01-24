var cryptoHelper = require('./../modules/crypto-helper')
	, mongoose = require('mongoose')
	, _ = require('lodash')
	, async = require('async')
	, moment = require('moment')
	, AWS = require('aws-sdk')
	, fs = require('fs');

User = mongoose.model('User');

UserModel = function(){};

UserModel.prototype.findOne = function(data, callback){
	User.findOne(data, function(err, user){
		if (err) callback(err);
		callback(null, user);
	});
};

UserModel.prototype.modifyData = function(user_id, displayName, email, callback){
	var self=this;
	User.findById(user_id, function(err, user){		
		if(displayName) user.name = displayName;
		if(email) user.email = email;
		user.save(function(err, modified_user){
			if(err) callback(err);
			callback(null, modified_user);
		});
	});
};


UserModel.prototype.uploadPhoto = function(user_id, data, callback){
	var self=this;
	User.findById(user_id, function(err, user){
		if(data) {
			self._uploadPhoto(user._id, data.profileData, function(err, data){
				if(err) callback(err);
				user.profile.profile_image_url = 'https://s3-eu-west-1.amazonaws.com/tvmoviefq/' + user._id;
				user.save(function(err, modified_user){
					if(err) callback(err);
					callback(null, modified_user);
				});
			});
		}
	});
};

UserModel.prototype.addUser = function(data, callback){
	cryptoHelper.saltAndHash(data.password, function(hash){
		User.create({
			username: data.username,
			name: data.name,
			password: hash,
			email: data.email
		}, function(err, user){
			if (err) callback('Error creating the user ' + err);
			else callback(null, user);
		});
	});
};


UserModel.prototype.changePassword = function(_email, password, callback){
	cryptoHelper.saltAndHash(password, function(hash){
		User.findOne({email: _email}, function(err, user){
			user.password = hash;
			user.save(function(err, user){
				if (err) callback('Error updating the password ' + err);
				else callback(null, user);
			});
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
	User.findById(user_id).populate('profile.following.user_following', 'username _id profile.profile_image_url').exec(function(err, user){
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

				_.forEach(follow.user_following.profile.moviesUnwatched
					, function(movie_f){
						results.push({
							username: follow.user_following.username,							
							user_id: follow.user_following._id,
							movie: movie_f.title,
							movie_id: movie_f._id,
							type: 'movieUnwatched',
							moviedb_id : movie_f.moviedb_id,
							thumbnail: movie_f.thumbnail,
							time_ago: moment(movie_f.created).fromNow(),
							created: movie_f.created
						});	
					}
				);

				_.forEach(follow.user_following.profile.moviesWatched
					, function(movie_f){
						results.push({
							username: follow.user_following.username,							
							user_id: follow.user_following._id,
							movie: movie_f.title,
							movie_id: movie_f._id,
							moviedb_id : movie_f.moviedb_id,
							type: 'movieWatched',
							thumbnail: movie_f.thumbnail,
							time_ago: moment(movie_f.created).fromNow(),
							created: movie_f.created
						});	
					}
				);

				asyncCallback();
			}
			,
			function(err){
				if(err) callback(err);

				var resultsSorted = _.sortBy(results, function(res){
					return -1 * res.created;
				});
				callback(null, resultsSorted);
			}
		);
		
	});
};

UserModel.prototype._uploadPhoto = function(user_id, data, callback){
	fs.readFile(data.path, function (err, dataP) {
		if(err) callback(err);
		var s3bucket = new AWS.S3({params: {Bucket: 'tvmoviefq'}});
		s3bucket.createBucket(function() {
		    var data = {Key: user_id.toString(), Body: dataP};
		    s3bucket.putObject(data, function(err, data) {
		        if (err) {
		      		console.log("Error uploading data: ", err);
		      		callback(err);
		    	} 
		    	else {
		      		console.log("Successfully uploaded data to myBucket/myKey: " + JSON.stringify(data));
		      		callback(null, data);
		    	}
		  	});
		});	  
	});	
};


UserModel.prototype.listFBfriends = function(user_id, callback){

};


UserModel.prototype.User = User;



exports.UserModel = UserModel;