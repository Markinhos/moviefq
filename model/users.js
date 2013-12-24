var cryptoHelper = require('./../modules/crypto-helper')
	, mongoose = require('mongoose');

User = mongoose.model('User');

User.schema.path('email').validate(function(value, respond) {
  User.findOne({email: value}, function(err, user) {
    if(err) throw err;
    if(user) return respond(false);
    respond(true);
  });
}, 'exists');

User.schema.path('user').validate(function(value, respond) {
  User.findOne({user: value}, function(err, user) {
    if(err) throw err;
    if(user) return respond(false);
    respond(true);
  });
}, 'exists');


User.schema.path('email').validate(function(email){
   var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
   return emailRegex.test(email);
}, 'The e-mail field cannot be empty.');

exports.findOne = function(data, callback){
	var User = mongoose.model('User');
	User.findOne(data).exec(callback);
}

exports.addUser = function(data, callback){
	cryptoHelper.saltAndHash(data.password, function(hash){
		User.create({
			user: data.user,
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

exports.removeAll = function(callback){
	User.remove({},function(err){
		if (err) callback(err);
		else callback(null, 'Removed');
	});
};

exports.User = User;