var mongoose = require('mongoose')
	,cryptoHelper = require('./../modules/crypto-helper');

var Movies = new mongoose.Schema({
	title: String,
	overview: String,
	release_date: Date,
	rating: Number,
	thumbnail: String,
	moviedb_id: String,
	genres: [{ id: String, name: String}],
	idmb_id: String
});

var Users = new mongoose.Schema({
	username: {type: String, required: true},
	email: {type: String, lowercase: true},
	fbId: String,
	password: String,
	created: {type: Date, default: Date.now},
	profile: {
		moviesUnwatched : [Movies],
		moviesWatched: [Movies],
		profile_image_url : String
	}
});

Users.path('email').validate(function(email){
   var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
   return emailRegex.test(email);
}, 'Wrong email');




Users.method('validPassword', function(plainPass){
	return cryptoHelper.validatePass(plainPass, this.password);
});

mongoose.model('User', Users);
mongoose.model('Movie', Movies);