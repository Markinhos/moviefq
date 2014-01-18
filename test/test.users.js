var should = require('should')
	, helper = require('./helper')
	, app = require('./../app.js')
	, users = require('./../model/users').UserModel
	, mongoose = require('mongoose');


describe('Users CRUD operations', function(){

	User = mongoose.model('User');

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
		User.remove({}, function(err){
			if (err) done(err);
			else done();
		});
	});

	after(function(){
		mongoose.connection.close();
	});

	it('empty user list', function(done){
		userModel.listUsers(function(err, users){
			if(err) done(err)
			else{
				users.should.be.empty;
				done();
			}			
		});
	});

	it('add one user', function(done){
		userModel.addUser(user_data, function(err, user){
			if (err) done(err);
			else {
				userModel.listUsers(function(err, docs){
					if (err) done(err);
					else {
						docs.should.have.length(1);
						done();
					}
				});
			}
		});
	});

	it('add one user with wrong email', function(done){
		userModel.addUser({
				user: 'paco',
				email: 'hola',
				password:'dummy'}
			, function(err, user){
					should.exist(err);
					done();
			}
		);
	});

	it('add one user with a taken email', function(done){
		userModel.addUser(user_data
			, function(err, user){
			if (err){
				done(err);
			}
			else {
				userModel.addUser({
					user: 'luis',
					email: 'email@test.com',
					password:'dummy'}
				, function(err, user){
					should.exist(err);
					done();
				});
			}
		});
	});

	it('add one user with a taken user', function(done){
		userModel.addUser(user_data
			, function(err, user){
			if (err){
				done(err);
			}
			else {
				userModel.addUser({
					user: 'paco',
					email: 'email2@test.com',
					password:'dummy'}
				, function(err, user){
					should.exist(err);
					done();
				});
			}
		});
	});


	it('find by user name', function(done){
		userModel.addUser(user_data, function(err, user){
			User.findOne({username : 'paco'}, function(err, user){
				if (err) done(err);
				user.should.have.property('username', 'paco');
				done();
			});
		})
	});

	it('list following', function(done){
		userModel.addUser(user_data, function(err, user){
			if (err) done(err);
			userModel.listFollowing(user._id, function(err, following){
				if (err) done(err);

				following.should.be.empty;
				done();
			});
		});
	});

	it('follow one user', function(done){
		userModel.addUser(user_data, function(err, user){
			if (err) done(err);
			userModel.addUser(user_data2, function(err, user2){
				userModel.followFriend(user._id, user2._id, function(err, following){
					following.should.have.length(1);
					following[0].user_following.should.eql(user2._id);
					done();
				});
			});
		});
	});

	it('list following with users', function(done){
		userModel.addUser(user_data, function(err, user){
			if (err) done(err);
			userModel.addUser(user_data2, function(err, user2){
				userModel.followFriend(user._id, user2._id, function(err, following){					
					userModel.listFollowing(user._id, function(err, following_friends){
						following_friends.should.have.length(1);
						following_friends[0].user_following.should.have.property('username', 'paquita');
						done();
					});
				});
			});
		});
	});


	it('list posible following ', function(done){
		userModel.addUser(user_data, function(err, user){
			if (err) done(err);
			userModel.addUser(user_data2, function(err, user2){
				userModel.followFriend(user._id, user2._id, function(err, following){					
					userModel.listAddFriends(user._id, function(err, following_friends){
						following_friends.should.be.empty;
						done();
					});
				});
			});
		});
	});

	it('unfollow one user', function(done){
		userModel.addUser(user_data, function(err, user){
			if (err) done(err);
			userModel.addUser(user_data2, function(err, user2){
				userModel.followFriend(user._id, user2._id, function(err, following){
					if(err) done(err);

					following.should.have.length(1);

					userModel.unfollowFriend(user._id, user2._id, function(err, following){
						if(err) done(err);
						following.should.be.empty;
						done();
					});
				});
			});
		});
	});


});