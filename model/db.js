var mongoose = require('mongoose');

var movieSchema = new mongoose.Schema({
	title: String,
	description: String,
	year: Date,
	rating: Number
});

mongoose.model('Movie', movieSchema);

mongoose.connect('mongodb://localhost/moviefq');