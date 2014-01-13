var should = require('should')
	, helper = require('./helper')
	, app = require('./../app.js')
	, MovieModel = require('./../model/movies').MovieModel
	, moviesDB = require('moviedb')('9663f34a62a3a65368393a6cfbe167b5')
	, mongoose = require('mongoose')
  	, sinon = require('sinon');


describe('Movies', function(){

	var user_f = null;
	var movieModel = null;
	User = mongoose.model('User');
	//Add a user before
	beforeEach(function(done){

		movieModel = new MovieModel(moviesDB);

		sinon
			.stub(moviesDB, 'movieInfo')
			.yields(null, { adult: false,
			  backdrop_path: '/bv6CY07f6c4msoDJxDzk5m22cYs.jpg',
			  belongs_to_collection: null,
			  budget: 78000000,
			  genres: 
			   [ { id: 28, name: 'Action' },
			     { id: 80, name: 'Crime' },
			     { id: 14, name: 'Fantasy' },
			     { id: 878, name: 'Science Fiction' } ],
			  homepage: '',
			  id: 9480,
			  imdb_id: 'tt0287978',
			  original_title: 'Daredevil',
			  overview: 'He dwells in a world of external night, but the blackness is filled with sounds and scents, tastes and textures that most cannot perceive. Although attorney Matt Murdock is blind, his other four senses function with superhuman sharpness. By day, Murdock represents the downtrodden. At night he is Daredevil, a masked vigilante stalking the dark streets of the city, a relentless avenger of justice.',
			  popularity: 2.09931218758919,
			  poster_path: '/dNVEqwgIdrwWQL3zXI5mQG60oM5.jpg',
			  production_companies: 
			   [ { name: '20th Century Fox', id: 25 },
			     { name: 'Marvel Entertainment, LLC', id: 325 } ],
			  production_countries: [ { iso_3166_1: 'US', name: 'United States of America' } ],
			  release_date: '2003-02-14',
			  revenue: 179179718,
			  runtime: 103,
			  spoken_languages: 
			   [ { iso_639_1: 'el', name: 'ελληνικά' },
			     { iso_639_1: 'en', name: 'English' },
			     { iso_639_1: 'it', name: 'Italiano' } ],
			  status: 'Released',
			  tagline: 'A Guardian Devil',
			  title: 'Daredevil',
			  vote_average: 5.1,
			  vote_count: 262 });

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
		
	});

	afterEach(function(done){

		moviesDB.movieInfo.restore();
		User.remove({}, function(err){
			if (err) done(err);
			done();
		});
	});

	it('Add one unwatched movie', function(done){
		movieModel.addUnwatchedMovie(user_f._id, '9480', function(err, movie){
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
		movieModel.addUnwatchedMovie(user_f._id, '9480', function(err, movie){
			if(err) done(err);
			else {
				movieModel.addUnwatchedMovie(user_f._id, '9480', function(err, movie){
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
		movieModel.addWatchedMovie(user_f._id, '9480', function(err, movie){
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
		movieModel.addUnwatchedMovie(user_f._id, '9480', function(err, movie){
			if(err) done(err);
			else {				
				movieModel.addWatchedMovie(user_f._id, '9480', function(err, movie){
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
		movieModel.addWatchedMovie(user_f._id, '9480', function(err, movie){
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
		
	});
})