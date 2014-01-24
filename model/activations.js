var mongoose = require('mongoose');


Activation = mongoose.model('Activation');


ActivationModel = function(){};

ActivationModel.prototype.verify = function(id, user, callback){
	console.log("Looking for activation id: " +id);
	Activation.findById(id, function(err, activation){		
		if(err) callback(err);
		if(!activation) callback('Not found');
		if (activation.email !== user.email) callback(null, false);
		user.verified = true;
		user.save(function(err, user){
			if(err) callback(err);

			activation.activated = true;
			activation.save(callback);			
		});
	});
};

ActivationModel.prototype.addActivation = function(_email, callback){
	Activation.create({
		email: _email
	}, function(err, activation){
		if(err) callback(err);
		callback(null, activation);
	});
};

exports.ActivationModel = ActivationModel;