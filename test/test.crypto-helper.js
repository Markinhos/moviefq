var cryptoHelper = require('./../modules/crypto-helper');
var should = require('should');


describe('cryptographic helpers', function(){

	it('check salt and hash', function(done){
		var pass = 'dummypass';
		var hashedPass = null;
		cryptoHelper.saltAndHash(pass, function(hashedPass){
			var isValid = null;
			cryptoHelper.validateHash(pass, hashedPass, function(err, isValid){
				if(err) done('Something wrong happended: ' + err);
				else{
					should(isValid).ok;
					done(null, 'Success');
				}
			})
		});
	});
});