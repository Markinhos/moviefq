var crypto = require('crypto');

exports.saltAndHash = function(pass, callback){
	var salt = generateSalt();
	callback(salt + sha1(pass+salt));
}

exports.validateHash = function(plainPass, hashedPass, callback){
	var salt = hashedPass.substr(0,10);
	var validHash = salt + sha1(plainPass + salt);
	callback(null, hashedPass === validHash);
}

exports.validatePass = function(plainPass, hashedPass, callback){
        var salt = hashedPass.substr(0,10);
        var validHash = salt + sha1(plainPass + salt);
        return hashedPass === validHash;
}

var generateSalt = function()
{
        var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
        var salt = '';
        for (var i = 0; i < 10; i++) {
                var p = Math.floor(Math.random() * set.length);
                salt += set[p];
        }
        return salt;
}

var sha1 = function(str){
	return crypto.createHash('sha1').update(str).digest('hex');
}