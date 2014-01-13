var mongoose = require('mongoose')
	, mdb = require('moviedb')('9663f34a62a3a65368393a6cfbe167b5')
  	, mdbconfig = require('./../modules/moviedbConfiguration')
  	, _ = require('lodash');

Movie = mongoose.model('Movie');
User = mongoose.model('User');


exports.addWatchedMovie = function(user_id, movie_id, callback){
	removeMovie(user_id, movie_id, 'moviesUnwatched', function(err){
		if(err) callback(err);
		else {
			addMovie(user_id, movie_id, 'moviesWatched', callback);	
		}
	});
}

exports.addUnwatchedMovie = function(user_id, movie_id, callback){
	addMovie(user_id, movie_id, 'moviesUnwatched', callback);
}

exports.deleteWatchedMovie = function(user_id, movie_id, callback){
	User.findById(user_id, function(err, user){
		if (err) callback(err);
		else {			
			var index;
			console.log("Movies watched: " + user.profile.moviesWatched);
			console.log("Ids " + movie_id);

			user.profile.moviesWatched.pull(movie_id);
			user.save(callback);
		}
	});
}


//Adds a movie based on the moviedb id. If added already skipped
addMovie = function(user_id, movie_id, type, callback) {
	User.findById(user_id, function(err, user) {
		if (err) console.log("Error finding user");
		else {
			var movie = _.find(user.profile[type], {moviedb_id : movie_id});
			if (!movie) {
				mdb.movieInfo({ id : movie_id}, function(err, movie) {
					if (err) console.log("Error adding movie");
					else{
						var newIndex = user.profile[type].push({
							title : movie.title,
							release_date: movie.release_date,
							thumbnail: movie.poster_path,
							moviedb_id: movie.id				
						}) - 1;
						user.save(function(err, user){
							if (err) callback(err);
							else {
								callback(null, user.profile[type][newIndex]);
							}
						});	
					}
				});			
			}
			//Is already added
			else {
				callback(null, user.profile[type][movie]);
			}
		}				
	});
}


//Removes a movie based on the moviedb id
removeMovie = function(user_id, _moviedb_id, type, callback){
	var User = mongoose.model('User');
	User.findById(user_id, function(err, user){
		if(err) {
			console.log("Error finding user");
			callback(err);
		}
		else {
			var movie = _.find(user.profile[type], {moviedb_id: _moviedb_id});
			if (movie){
				user.profile[type].pull(movie._id);
				user.save(callback);
			}
			else{
				callback(null);
			}
		}
	});
}