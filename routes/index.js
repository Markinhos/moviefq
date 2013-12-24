var mongoose = require('mongoose');

exports.index = function(req, res){
	var Movie = mongoose.model('Movie');
	Movie.find({}, function(err, moviesSet){
		res.render('index', { title: 'TV square', movies: moviesSet });
	});
};