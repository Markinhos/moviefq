var mongoose = require('mongoose')
	,cryptoHelper = require('./../modules/crypto-helper');

var Schema = mongoose.Schema;

var Movies = new mongoose.Schema({
	title: String,
	overview: String,
	release_date: Date,
	rating: Number,
	thumbnail: String,
	moviedb_id: String,
	created: {type: Date, default: Date.now},
	genres: [{ id: String, name: String}],
	idmb_id: String,
	user_rating: Number,
	hidden: Boolean
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
		events: [{
			event_type: {type: String, enum: ['follow'] },
			user_who_follows: { type: Schema.ObjectId, ref: Users }
		}],
		following: [{
			user_following: {type: Schema.ObjectId, ref: Users}	,
			follow_since: {type: Date, default: Date.now}
		}],
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