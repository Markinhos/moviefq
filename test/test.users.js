var should = require('should')
	, helper = require('./helper')
	, app = require('./../app.js')
	, users = require('./../model/users')
	, mongoose = require('mongoose');


describe('Users CRUD operations', function(){

	User = mongoose.model('User');

	var user_data = {
		username: 'paco',
		password: 'dummypass',
		email: 'email@test.com'
	};

	beforeEach(function(done){
		User.remove({}, function(err){
			if (err) done(err);
			else done();
		});
	});

	after(function(){
		mongoose.connection.close();
	});

	it('empty user list', function(done){
		users.listUsers(function(err, users){
			if(err) done(err)
			else{
				users.should.be.empty;
				done();
			}			
		});
	});

	it('add one user', function(done){
		users.addUser(user_data, function(err, user){
			if (err) done(err);
			else {
				users.listUsers(function(err, docs){
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
		users.addUser({
				user: 'paco',
				email: 'hola',
				password:'dummy'}
			, function(err, user){
			if (err){
				done(null, 'This should fail!');
			}
			else {
				done('Error adding a wrong email');
			}
		});
	});

	it('add one user with a taken email', function(done){
		users.addUser(user_data
			, function(err, user){
			if (err){
				done(err);
			}
			else {
				users.addUser({
					user: 'luis',
					email: 'email@test.com',
					password:'dummy'}
				, function(err, user){
					if(err){
						done(null, 'This should fail!');
					}
					else{
						done('Error adding a taken email');
					}
				});
			}
		});
	});

	it('add one user with a taken user', function(done){
		users.addUser(user_data
			, function(err, user){
			if (err){
				done(err);
			}
			else {
				users.addUser({
					user: 'paco',
					email: 'email2@test.com',
					password:'dummy'}
				, function(err, user){
					if(err){
						done(null, 'This should fail!');
					}
					else{
						done('Error adding a taken email');
					}
				});
			}
		});
	});


	it('find by user name', function(done){
		users.addUser(user_data, function(err, user){
			var user_found = null;
			User.findOne({username : 'paco'}, function(err, user){
				if (err) done(err);
				else{
					user.should.have.property('username', 'paco');
					done(null, user);
				}
			});
		})
	});


});