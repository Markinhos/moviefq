var mongoose = require('mongoose')
	, mdb = require('moviedb')('9663f34a62a3a65368393a6cfbe167b5')
  	, mdbconfig = require('./../modules/moviedbConfiguration')
  	, tomatoes = require('tomatoes')
  	, movies = tomatoes('57nwpwxr9x8ke6ksp4rrkz5t')
  	, movieModel = require('../model/movies')
  	, _ = require('lodash');

_mdb_config = null;
mdb_config = function(callback){
	if(_mdb_config !== null) callback(null, _mdb_config);
	else {
		mdbconfig.movieDBconfiguration(function(err, config){
			if (err) console.log("MDB config error");
			else {
				console.log("Configuration m " + config);
				_mdb_config = config;
				callback(null, config);
			}
		});
	} 
}


var Movie = mongoose.model('Movie');

exports.saveMovie = function(req, res){
	/*Movie.create({title: req.param('title')}, function(err, movie){
		if (err) console.log('Error creating movie');
		else{
			res.redirect('/');
		}
	});*/
};

exports.addWatchedMovie = function(req, res){	
	var movie_id = req.param('id');

	movieModel.addWatchedMovie(req.user._id, movie_id, function(){
		res.redirect('/watchedMovies');
	});
}

exports.addUnwatchedMovie = function(req, res){
	var movie_id = req.param('id');

	movieModel.addUnwatchedMovie(req.user._id, movie_id, function(){
		res.redirect('/unwatchedMovies');
	});
}



exports.unwatchedMovies = function(req, res){
	var username = req.user.username;
	var User = mongoose.model('User');
	
	this.mdb_config(function(err, config){
		User.findOne({username: username}, function(err, user){
			var unwatched_movies = user.profile.moviesUnwatched;
			console.log(unwatched_movies);

			res.render('moviesList', {title: 'Watchlist', movies: unwatched_movies, unwatched_movies: true, mdb_imgurl : config.images.base_url + config.images.poster_sizes[0] });
		});
	});
}

exports.watchedMovies = function(req, res){
	var username = req.user.username;
	var User = mongoose.model('User');

	mdb_config(function(err, config){
		User.findOne({username: username}, function(err, user){
			var watched_movies = user.profile.moviesWatched;
			console.log(watched_movies);
				res.render('moviesList', {title: 'Movies watched', movies: watched_movies, watched_movies: true, mdb_imgurl : config.images.base_url + config.images.poster_sizes[0] });
		});
	});
}

exports.searchMovie = function(req, res){
	var movieName = req.param('movieName');
	mdb_config(function(err, config){
		mdb.searchMovie({query: movieName }, function(err, moviesRes){
		  	console.log(moviesRes);
			res.render('moviesList', { title: 'Movie search', movies: moviesRes.results, 
				mdb_imgurl : config.images.base_url + config.images.poster_sizes[0] });
		});
	});
	/*movies.search(movieName, function(err, moviesRes){
		res.render('movies', { title: 'Movie search', movies: moviesRes});
	});*/
}
