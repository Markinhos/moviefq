var mongoose = require('mongoose')
	, moviesDB = require('moviedb')('9663f34a62a3a65368393a6cfbe167b5')
  	, mdbconfig = require('./../modules/moviedbConfiguration')
  	, MovieModel = require('../model/movies').MovieModel
  	, _ = require('lodash');

_mdb_config = null;

var movieModel = new MovieModel(moviesDB);
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
};


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
	
	this.mdb_config(function(err, config){
		movieModel.listUnwatchedMovies(req.user._id, function(err, results){
			if(err) console.log("Error " + err);
			res.render('moviesList', {title: 'Watchlist', movies: results, unwatched_movies: true, mdb_imgurl : config.images.base_url + config.images.poster_sizes[0] });
		});
	});
};

exports.watchedMovies = function(req, res){

	this.mdb_config(function(err, config){
		movieModel.listWatchedMovies(req.user._id, function(err, results){
			if(err) console.log("Error " + err);
			res.render('moviesList', {title: 'Movies watched', movies: results, watched_movies: true, mdb_imgurl : config.images.base_url + config.images.poster_sizes[0] });
		});
	});
};

exports.listWatchedTagMovies = function(req, res){
	this.mdb_config(function(err, config){
		movieModel.listWatchedTagMovies(req.user._id, req.params.tagName, function(err, results){
			if(err) console.log("Error " + err);
			res.render('moviesList', {title: 'Movies tag', tag: req.params.tagName, movies: results, watched_movies: true, mdb_imgurl : config.images.base_url + config.images.poster_sizes[0] });
		});
	});	
};

exports.listUnwatchedTagMovies = function(req, res){
	this.mdb_config(function(err, config){
		movieModel.listUnwatchedTagMovies(req.user._id, req.params.tagName, function(err, results){
			if(err) console.log("Error " + err);
			res.render('moviesList', {title: 'Movies tag', tag: req.params.tagName, movies: results, unwatched_movies: true, mdb_imgurl : config.images.base_url + config.images.poster_sizes[0] });
		});
	});	
};

exports.getMoviesUser = function(req, res){
	this.mdb_config(function(err, config){
		movieModel.getMoviesUser(req.params.userId, function(err, results){
			if(err) console.log("Error " + err);
			res.render('moviesListUser', {title: 'Movies from user', movies: results, unwatched_movies: true, mdb_imgurl : config.images.base_url + config.images.poster_sizes[0] });
		});
	});	
};

exports.searchMovie = function(req, res){
	var movieName = req.param('movieName');
	this.mdb_config(function(err, config){
		/*mdb.searchMovie({query: movieName }, function(err, moviesRes){
			mdb.searchTVShow({query: movieName }, function(err, tvRes){
			  	var result = _.union(moviesRes.results, tvRes.results);
				res.render('moviesList', { title: 'Movie search', movies: _.sortBy(result, function(elem) {return -1 * elem.popularity}), 
					mdb_imgurl : config.images.base_url + config.images.poster_sizes[0] });

			});
		});*/
		movieModel.searchMovies(movieName, function(err, result){
			res.render('moviesList', { title: 'Movie search', movies: result, 
					mdb_imgurl : config.images.base_url + config.images.poster_sizes[0], movie_search: true });
		});

	});
	/*movies.search(movieName, function(err, moviesRes){
		res.render('movies', { title: 'Movie search', movies: moviesRes});
	});*/
};
