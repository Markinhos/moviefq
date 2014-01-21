var should = require('should')
	, helper = require('./helper')
	, app = require('./../app.js')
	, MovieModel = require('./../model/movies').MovieModel
	, UserModel = require('./../model/users').UserModel
	, moviesDB = require('moviedb')('9663f34a62a3a65368393a6cfbe167b5')
	, mongoose = require('mongoose')
  	, sinon = require('sinon')
  	, fixtures = require('./fixtures');

describe('Feed operations', function(){

	User = mongoose.model('User');


	var movieModel = null;
	var movie_fixture_id = fixtures.movies.Daredevil.id.toString();

	var user_data = {
		username: 'paco',
		password: 'dummypass',
		email: 'email@test.com'
	};

	var user_data2 = {
		username: 'paquita',
		password: 'dummypass',
		email: 'paquita@test.com'
	};

	var userModel = null;

	beforeEach(function(done){
		userModel = new UserModel();

		movieModel = new MovieModel(moviesDB);


		sinon
			.stub(moviesDB, 'searchMovie')
			.yields(null, fixtures.moviesList)

		sinon
			.stub(moviesDB, 'movieInfo')
			.yields(null, fixtures.movies.Daredevil);

		User.remove({}, function(err){
			if (err) done(err);
			else done();
		});
	});

	afterEach(function(done){

		moviesDB.movieInfo.restore();
		moviesDB.searchMovie.restore();
		User.remove({}, function(err){
			if (err) done(err);
			done();
		});
	});


	it('test feed', function(done){
		userModel.addUser(user_data, function(err, user){
			if (err) done(err);
			userModel.addUser(user_data2, function(err, user2){
				if(err) done(err);
				userModel.followFriend(user._id, user2._id, function(err, following){
					movieModel.addUnwatchedMovie(user2._id, movie_fixture_id, function(err, movie){
						if(err) done(err);
						else {
							movieModel.addWatchedMovie(user2._id, fixtures.movies.Untouchables.id, function(err, movie){
								if(err) done(err);
								userModel.feed(user._id, function(err, feed){
									if (err) done(err);

									feed.should.have.length(2);
									feed[0].should.have.property('username', 'paquita');
									feed[0].should.have.property('type', 'movieWatched');
									feed[1].should.have.property('username', 'paquita');
									feed[1].should.have.property('type', 'movieUnwatched');
									done();
								});
							});
						}
					});
				});
			});
		});
	});


});