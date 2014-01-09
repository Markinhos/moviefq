var cryptoHelper = require('./../modules/crypto-helper')
	, mongoose = require('mongoose');

User = mongoose.model('User');

exports.findOne = function(data, callback){
	var User = mongoose.model('User');
	User.findOne(data).exec(callback);
}

exports.addUser = function(data, callback){
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

exports.listUsers = function(callback){

	User.find().exec(function(err, users){
		if (err) callback(error);
		else {
			if (users === null) callback(null, []);
			else {
				callback(null, users);
			}
		}
	});
};

exports.findUserByName = function(name, callback){
	User.findOne({user: name}, function(err, user){
		if(err) callback(err);
		else {
			callback(null, user);
		}
	});
}