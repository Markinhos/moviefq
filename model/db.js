var mongoose = require('mongoose')
	,cryptoHelper = require('./../modules/crypto-helper');

var Movies = new mongoose.Schema({
	title: String,
	description: String,
	year: Date,
	rating: Number
});

var Users = new mongoose.Schema({
	user: String,
	email: {type: String, lowercase: true},
	fbId: String,
	password: String,
	created: {type: Date, default: Date.now},
	moviesWatched: [Movies]
});

Users.method('validPassword', function(plainPass){
	var isValid = null;
	return cryptoHelper.validatePass(plainPass, this.password);
});

mongoose.model('User', Users);
mongoose.model('Movie', Movies);