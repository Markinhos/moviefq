var mongoose = require('mongoose');

index = function(req, res){
	var Movie = mongoose.model('Movie');
	Movie.find({}, function(err, moviesSet){
		res.render('index', { title: 'TV square', movies: moviesSet });
	});
};

saveMovie = function(req, res){
	var Movie = mongoose.model('Movie');
	Movie.create({title: req.param('title')}, function(err, movie){
		if (err) console.log('Error creating movie');
		else{
			res.redirect('/');
		}
	});
}

exports.index = index;
exports.saveMovie = saveMovie;