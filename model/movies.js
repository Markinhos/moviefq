var mongoose = require('mongoose');

Movie = mongoose.model('Movie');
exports.movielist = function movielist(name, callback){
    Movie.find({title: name}, function(err, movies){
        if(err){
            console.log(err);
        }else{
            console.log(movies);
            callback(null, movies);
        }
    });
}