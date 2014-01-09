var mongoose = require('mongoose')
	, mdb = require('moviedb')('9663f34a62a3a65368393a6cfbe167b5')
  	, mdbconfig = require('./../modules/moviedbConfiguration')
  	, _ = require('lodash');

Movie = mongoose.model('Movie');
User = mongoose.model('User');


exports.addWatchedMovie = function(user_id, movie_id, callback){
	removeMovie(user_id, movie_id, 'moviesUnwatched', function(err){
		if(err) console.log('Error removing a movie');
		else {
			addMovie(user_id, movie_id, 'moviesWatched', callback);	
		}
	});
}

exports.addUnwatchedMovie = function(user_id, movie_id, callback){
	addMovie(user_id, movie_id, 'moviesUnwatched', callback);
}


//Adds a movie based on the moviedb id. If added already skipped
addMovie = function(user_id, movie_id, type, callback) {
	User.findById(user_id, function(err, user) {
		if (err) console.log("Error finding user");
		else {
			var indexOfMovie;
			if ((indexOfMovie = _.findIndex(user.profile[type], {moviedb_id : movie_id}) ) === -1) {
				mdb.movieInfo({ id : movie_id}, function(err, movie) {
					if (err) console.log("Error adding movie");
					else{
						user.profile[type].push({
							title : movie.title,
							release_date: movie.release_date,
							thumbnail: movie.poster_path,
							moviedb_id: movie.id				
						});
						user.save(callback);	
					}
				});			
			}
			//Is already added
			else {
				callback(null, user.profile[type][indexOfMovie]);
			}
		}				
	});
}


//Removes a movie based on the moviedb id
removeMovie = function(user_id, movie_id, type, callback){
	var User = mongoose.model('User');
	User.findById(user_id, function(err, user){
		if(err) {
			console.log("Error finding user");
			callback(err);
		}
		else {
			var index;
			if ((index = _.findIndex(user.profile[type], {moviedb_id: movie_id})) !== -1){
				user.profile[type].pull(user.profile[type][index]._id);
				user.save(callback);
			}
			else{
				callback(null);
			}
		}
	});
}