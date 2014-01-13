var should = require('should')
	, helper = require('./helper')
	, app = require('./../app.js')
	, MovieModel = require('./../model/movies').MovieModel
	, moviesDB = require('moviedb')('9663f34a62a3a65368393a6cfbe167b5')
	, mongoose = require('mongoose');


describe('Movies', function(){

	var user_f = null;
	var movieModel = null;
	User = mongoose.model('User');
	//Add a user before
	beforeEach(function(done){
		User = mongoose.model('User');
		User.create({
			username: 'paco',
			email: 'bla@bla.com'
		}, function(err, user){
			if (err) done(err);
			else{				
				user_f = user;
				done();
			}
		});

		movieModel = new MovieModel(moviesDB);
	});

	afterEach(function(done){
		User.remove({}, function(err){
			if (err) done(err);
			else done();
		});
	});

	it('Add one unwatched movie', function(done){
		movieModel.addUnwatchedMovie(user_f._id, '349', function(err, movie){
			if(err) done(err);
			else {
				User.findById(user_f, function(err, user){
					if(err) done(err);
					else {					
						user.profile.moviesUnwatched.should.have.length(1);
						done();
					}
				});
			}
		});
	});

	it('Add two unwatched movie', function(done){
		movieModel.addUnwatchedMovie(user_f._id, '349', function(err, movie){
			if(err) done(err);
			else {
				movieModel.addUnwatchedMovie(user_f._id, '349', function(err, movie){
					if (err) done(err);
					else {
						User.findById(user_f, function(err, user){
							if(err) done(err);
							else {					
								user.profile.moviesUnwatched.should.have.length(1);
								done();
							}
						});						
					}
				});
			}
		});
	});

	it('Add one watched movie', function(done){
		movieModel.addWatchedMovie(user_f._id, '348', function(err, movie){
			if(err) done(err);
			else {
				User.findById(user_f._id, function(err, user){
					if(err) done(err);
					else {					
						user.profile.moviesWatched.should.have.length(1);
						done();
					}
				});
			}
		});
	});

	it('Add one watched movie from unwatched', function(done){
		movieModel.addUnwatchedMovie(user_f._id, '348', function(err, movie){
			if(err) done(err);
			else {				
				movieModel.addWatchedMovie(user_f._id, '348', function(err, movie){
					if(err) done(err);
					else {
						User.findById(user_f._id, function(err, user){
							if(err) done(err);
							else {			
								user.profile.moviesWatched.should.have.length(1);
								user.profile.moviesUnwatched.should.have.length(0);
								done();
							}
						});
					}
				});
			}
		});
	});

	it('Remove one watched movie', function(done){
		movieModel.addWatchedMovie(user_f._id, '348', function(err, movie){
			if(err) done(err);
			else {
				User.findById(user_f._id, function(err, user){	
					if(err) done(err);
					else {
						user.profile.moviesWatched.should.have.length(1);
						movieModel.deleteWatchedMovie(user_f._id, movie._id, function(err, callback){
							if (err) done(err);
							else{
								User.findById(user_f._id, function(err, newUser){
									if(err) done(err);
									else{
										newUser.profile.moviesWatched.should.have.length(0);
										done();
									}
								});						
							}
						});
					}
				});
			}
		});
		
	})
})