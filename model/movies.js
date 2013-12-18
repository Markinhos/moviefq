var mongoose = require('mongoose');

exports.movielist = function movielist(name, callback){
    var Movie = mongoose.model('Movie');
    Movie.find({title: name}, function(err, movies){
        if(err){
            console.log(err);
        }else{
            console.log(movies);
            callback(null, movies);
        }
    });
}