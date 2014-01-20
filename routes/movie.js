var mongoose = require('mongoose')
	, moviesDB = require('moviedb')('9663f34a62a3a65368393a6cfbe167b5')
  	, MovieModel = require('../model/movies').MovieModel
  	, _ = require('lodash');

var movieModel = new MovieModel(moviesDB);


var Movie = mongoose.model('Movie');

exports.addWatchedMovie = function(req, res){	
	var movie_id = req.param('id');
	movieModel.addWatchedMovie(req.user._id, movie_id, function(err){
		if(err) console.log("Error " + err);
		res.redirect('/watchedMovies');
	});
};

exports.addUnwatchedMovie = function(req, res){
	var movie_id = req.param('id');
	movieModel.addUnwatchedMovie(req.user._id, movie_id, function(err){
		if (err) {
			console.log(err);		
		}
		res.redirect('/unwatchedMovies');
	});
};

exports.deleteWatchedMovie = function(req, res) {
	var movie_id = req.param('id');
	movieModel.deleteWatchedMovie(req.user._id, movie_id, function(err, user){
		if(err) {
			console.log("Error removing the movie: " + err);
			res.redirect('/watchedMovies');
		}
		else res.redirect('/watchedMovies');		
	});

};

exports.unwatchedMovies = function(req, res){
	movieModel.listUnwatchedMovies(req.user._id, function(err, results){
		if(err) console.log("Error " + err);
		res.render('moviesList', {title: 'Watchlist', movies: results, unwatched_movies: true });
	});
};

exports.watchedMovies = function(req, res){
	movieModel.listWatchedMovies(req.user._id, function(err, results){
		if(err) console.log("Error " + err);
		res.render('moviesList', {title: 'Movies watched', movies: results, watched_movies: true});
	});
};

exports.listWatchedTagMovies = function(req, res){
	movieModel.listWatchedTagMovies(req.user._id, req.params.tagName, function(err, results){
		if(err) console.log("Error " + err);
		res.render('moviesList', {title: 'Movies tag', tag: req.params.tagName, movies: results, watched_movies: true });
	});	
};

exports.listUnwatchedTagMovies = function(req, res){
	movieModel.listUnwatchedTagMovies(req.user._id, req.params.tagName, function(err, results){
		if(err) console.log("Error " + err);
		res.render('moviesList', {title: 'Movies tag', tag: req.params.tagName, movies: results });
	});
};

exports.getMoviesUser = function(req, res){
	movieModel.getMoviesUser(req.params.userId, function(err, results){
		if(err) console.log("Error " + err);
		res.render('moviesListUser', {title: 'Movies from user', movies: results, unwatched_movies: true });
	});
};

exports.searchMovie = function(req, res){
	movieModel.searchMovies(req.param('movieName'), function(err, result){
		if(err) console.log("Error " + error);
		res.render('moviesList', { title: 'Movie search', movies: result, movie_search: true });
	});
};
