var mongoose = require('mongoose')
  	, _ = require('lodash')
  	, async = require('async');

Movie = mongoose.model('Movie');
User = mongoose.model('User');



MovieModel = function(_movieProvider){
	this.movieProvider = _movieProvider
};


youtube_url = '//www.youtube.com/embed/';


MovieModel.prototype.addWatchedMovie = function(user_id, movie_id, callback){
	var self = this;
	this._removeMovie(user_id, movie_id, 'moviesUnwatched', function(err){
		if(err) callback(err);
		else {
			self._addMovie(user_id, movie_id, 'moviesWatched', callback);	
		}
	});
};

MovieModel.prototype.addUnwatchedMovie = function(user_id, movie_id, callback){
	this._addMovie(user_id, movie_id, 'moviesUnwatched', callback);
}

MovieModel.prototype.deleteWatchedMovie = function(user_id, movie_id, callback){
	this._removeMovieById(user_id, movie_id, 'moviesWatched', callback);
};


MovieModel.prototype.listWatchedMovies = function(user_id, callback){
	this._listMovies(user_id, 'moviesWatched', callback);
};

MovieModel.prototype.listUnwatchedMovies = function(user_id, callback){
	this._listMovies(user_id, 'moviesUnwatched', callback);
};


MovieModel.prototype.searchMovies = function(name, callback){
	this.movieProvider.searchMovie({query: name }, function(err, moviesRes){
	  	//var sortedResult = _.sortBy(moviesRes.results, function(elem) {return -1 * elem.popularity});
		callback(null, moviesRes.results);
	});
};

MovieModel.prototype.listWatchedTagMovies = function(user_id, tagName, callback){
	this._listTags(user_id, tagName, 'moviesWatched', callback);
};

MovieModel.prototype.listUnwatchedTagMovies = function(user_id, tagName, callback){
	this._listTags(user_id, tagName, 'moviesUnwatched', callback);
};

MovieModel.prototype.getMovie = function(moviedb_id, callback) {
	var self = this;
	this.movieProvider.movieInfo({ id : moviedb_id}, function(err, movie) {
		if (err) callback(err);
		else{
			self.movieProvider.movieTrailers({id : moviedb_id}, function(err, trailers){
				if(trailers.youtube.length > 0){
					movie.trailer_url = youtube_url + trailers.youtube[0].source;
				}
				callback(null, movie);
			});
		}
	});	
};

MovieModel.prototype.getMoviesUser = function(user_id, callback){
	var self = this;
	var movies = {moviesWatched: [], moviesUnwatched: []};

	this.listWatchedMovies(user_id, function(err, watchedMovies){
		if (err) callback(err);
		movies.moviesWatched = _.sortBy(watchedMovies, function(elem) { return -1 * elem.created } );
		self.listUnwatchedMovies(user_id, function(err, unwatchedMovies){
			if(err) callback(err);
			movies.moviesUnwatched = _.sortBy(unwatchedMovies, function(elem) { return -1 * elem.created });
			User.findById(user_id, function(err, user){
				movies.username = user.username;				
				callback(null, movies);
			});
		});
	});
};

MovieModel.prototype._listTags = function(user_id, tagName, type, callback){
	this._listMovies(user_id, type, function(err, movies){
		if(err) callback(err);

		async.filter(
			movies, 
			function (movie, asyncCallback){
				asyncCallback(
					_.find(movie.genres, function(genre){
						return (genre.name === tagName);
					})
				);
			}, 
			function(taggedMovies){
				callback(null, taggedMovies);
			}
		);
	});
};

MovieModel.prototype._listMovies = function(user_id, type, callback){
	User.findById(user_id, function(err, user){
		if(err) callback(err);
		else{
			callback(null, user.profile[type]);
		}
	});
};

//Adds a movie based on the moviedb id. If added already skipped
MovieModel.prototype._addMovie = function(user_id, movie_id, type, callback) {
	var self = this;
	User.findById(user_id, function(err, user) {
		if (err) callback("Error finding user " + err);
		else {
			var movie = _.find(user.profile[type], {moviedb_id : movie_id});
			if (!movie) {
				self.movieProvider.movieInfo({ id : movie_id}, function(err, movie) {
					if (err) callback(err);
					else{
						var newIndex = user.profile[type].push({
							title : movie.title,
							overview: movie.overview,
							genres: movie.genres,
							imdb_id: movie.imdb_id,
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
				callback(null, movie);
			}
		}				
	});
};


//Removes a movie based on the moviedb id
MovieModel.prototype._removeMovie = function(user_id, _moviedb_id, type, callback){
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
};


MovieModel.prototype._removeMovieById = function(user_id, movie_id, type, callback){
	User.findById(user_id, function(err, user){
		if (err) callback(err);
		else {
			user.profile[type].pull(movie_id);
			user.save(callback);
		}
	});
}

exports.MovieModel = MovieModel;