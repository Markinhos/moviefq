var mdb = require('moviedb')('9663f34a62a3a65368393a6cfbe167b5');

mdbConfiguration = null;


exports.movieDBconfiguration = function(callback){
	if (mdbConfiguration === null){
		configureMovieDB(function(err, configuration){
			if (err) throw err;
			else{
				mdbConfiguration = configuration;
				console.log('Configuration MDB' + configuration);
				callback(null, mdbConfiguration);	
			}
		});
	}
	else{
		callback(null, mdbConfiguration);
	}
}

configureMovieDB = function(callback){
	mdb.configuration(function(err, configuration){
		if(err) callback(err);

	  	console.log("other config " + configuration);
		callback(null, configuration);
	});
}
