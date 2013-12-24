var mongoose = require('mongoose')
	, mdb = require('moviedb')('9663f34a62a3a65368393a6cfbe167b5')
  	, mdbconfig = require('./../modules/moviedbConfiguration')
  	, tomatoes = require('tomatoes')
  	, movies = tomatoes('57nwpwxr9x8ke6ksp4rrkz5t');

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

exports.saveMovie = function(req, res){
	var Movie = mongoose.model('Movie');
	Movie.create({title: req.param('title')}, function(err, movie){
		if (err) console.log('Error creating movie');
		else{
			res.redirect('/');
		}
	});
};

exports.searchMovie = function(req, res){
	var movieName = req.param('movieName');
	/*this.mdb_config(function(err, config){
		mdb.searchTVShow({query: movieName }, function(err, moviesRes){
		  	console.log(moviesRes);
			res.render('movies', { title: 'Movie search', movies: moviesRes.results, 
				mdb_imgurl : config.images.base_url + config.images.poster_sizes[0] });
		});
	});*/
	movies.search(movieName, function(err, moviesRes){
		console.log(moviesRes);
		res.render('movies', { title: 'Movie search', movies: moviesRes});
	});
}
