var dblite = require('dblite'),
    db = dblite('db.sqlite');

db.query('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, userid TEXT, health INTEGER, score INTEGER, money INTEGER, useragent TEXT, value TEXT)');

// Table of Contents:
module.exports = {
  checkIfUserExist: function (userid) {
	  checkIfUserExist(userid)
  },
  readScore: function (userid) {
	  readScore(userid)
  },
  updatePoints: function (type,userid) {
	  updatePoints(type,userid)
  }
};

// Only if you run d*b.js directly
checkIfUserExist ("dion");

function checkIfUserExist (userid) {
	global["rows_" + userid] = NaN;
	global["checkIfUserExist_" + userid] = false;

	db.query('SELECT * FROM users WHERE userid = ?',
	  [userid],
	  {
	    id: Number,
	    userid: String
	  },
	  function (rows) {
	  	global["rows_" + userid] = rows;
	  }
	);


	var refreshIntervalId = setInterval(function () {
		if (typeof global["rows_" + userid] == "object") {
			rows = global["rows_" + userid];

			var i = 0;
            Object.keys(rows).forEach(function(key) {
            	console.log(rows[key]);
            	i++;
            });

            if (i == 1) {
				global["checkIfUserExist_" + userid] = true;
            };

            if (i > 1 ) {
            	console.log("XXXXXX  ERROR more than one user with the same name");
            };

            if (i < 1) {
            	console.log("> User " + userid + " going to added to DB");
            	addNewUser (userid);
            };

		clearInterval(refreshIntervalId);
		};
	},10);

}//e/CheckIfUserExist


function addNewUser (userid) {
	// NEVER USE THIS FUNCTION DIRECTLY!

	// First Check if user exist
	
	global["latestid_" + userid] = NaN;

	var latestid = NaN;

	db.query('SELECT MAX(id) FROM users', function (err, rows) {
		latestid = rows[0][0]
		if (isNaN(latestid) ) {
			console.log("error NaN");
			latestid = 5000;
		};
		global["latestid_" + userid] = latestid;
	});

	var refreshIntervalId = setInterval(function () {
		if (!isNaN(global["latestid_" + userid]) ) {

			latestid = global["latestid_" + userid];
			latestid++;

			db.query('INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?)',
			  [latestid, userid, 100, 0, 0, null, null]
			);
			global["checkIfUserExist_" + userid] = true;
			clearInterval(refreshIntervalId);

		}
	},10)

}

// only for running d*b.js directly
// readScore("dion");

global["score"] = {};
global["health"] = {};
global["money"] = {};

function readScore (userid) {
	global["readScore_" + userid] = false;

	var refreshIntervalId = setInterval(function () {
		if (global["checkIfUserExist_" + userid]) {

			db.query('SELECT * FROM users WHERE userid = ?', [userid], {
			    id: Number,
			    userid: String,
			    health: Number,
				score: Number,
				money: Number
			}, function (err, rows) {
				var record = rows[0];
		  		
		  		if (isNaN(record.score)) {
					global["score"][userid] = 0;
		  		} else {
			  		global["score"][userid] = record.score;
		  		}

		  		if (isNaN(record.health)) {
					global["health"][userid] = 0;
		  		} else {
			  		global["health"][userid] = record.health;
		  		}

		  		if (isNaN(record.money)) {
					global["money"][userid] = 0;
		  		} else {
			  		global["money"][userid] = record.money;
		  		}
	  			global["readScore_" + userid] = true;

				// global["score"][userid] = record.score;
				// global["health"][userid] = record.health;
				// global["money"][userid] = record.money;

			});

			clearInterval(refreshIntervalId);

		};
	},10)


}//e//readScore

// Read Score + on Login


// Write Score Read Score +1

setTimeout( function () {
		updatePoints ("score","dion");
},40);


function updatePoints (type,userid) {

	var refreshIntervalId = setInterval(function () {
		if (global["checkIfUserExist_" + userid]) {
			
			if (type === "score" || type === "health" || type === "money" || type === "useragent") {
				db.query("UPDATE users SET "+ type +" = '" + global["score"][userid] + "' WHERE userid = '" + userid +"'");

				// http://www.tutorialspoint.com/sql/sql-update-query.htm
				// UPDATE CUSTOMERS SET ADDRESS = 'Pune' WHERE ID = 6;

				clearInterval(refreshIntervalId);
			};//e/score
		};
	},10)

}//e/e/updatePoints






	
	// // use the fields to parse back the object
	// db.query('SELECT * FROM users WHERE id = ?', [123], {
	//   id: Number,
	//   value: JSON.parse // value unserialized
	// }, function (err, rows) {
	//   var record = rows[0];
	//   global["record"] = record;
	//   console.log(record.id); // 123
	//   console.log(record.value.name); // "dblite"
	//   console.log(record.value.rate); // "awesome""
	// });

	// setInterval( function () {
	// 	console.log(global["record"]);

	// },500);


	// var users = db.query('SELECT * FROM users', {
	//   key: Number,
	//   value: String
	// });


	// console.log(typeof users);








	// var q = db.query('SELECT * FROM users', {
	//   key: Number,
	//   value: String
	// });


	// console.log("----");



	// db.query('INSERT OR IGNORE INTO users VALUES(?, ?)', [
	//   1,
	//   {userid: 'dblite', rate: 'awesome ' } // value serialized
	// ]);



	// db.close();




// db.on('info', function (data) {
//   // show data returned by special syntax
//   // such: .databases .tables .show and others
//   console.log(data);
//   // by default, it does the same
// });
// db.on('error', function (err) {
//   // same as `info` but for errors
//   console.error(err.toString());
//   // by default, it does the same
// });


// db.on('close', function (code) {
//   // by default, it logs "bye bye"
//   // invoked once the database has been closed
//   // and every statement in the queue executed
//   // the code is the exit code returned via SQLite3
//   // usually 0 if everything was OK
//   console.log('safe to get out of here ^_^_');
// });











// Write to DB

// // test has two fields, id and value
// db.query('INSERT OR IGNORE INTO users VALUES(?, ?)', [
//   1,
//   {userid: 'dblite', rate: 'awesome ' } // value serialized
// ]);



// // Read from DB
// // use the fields to parse back the object
// db.query('SELECT * FROM users WHERE id = ?', [1], {
//   id: Number,
//   value: JSON.parse // value unserialized
// }, function (err, rows) {
//   var record = rows[0];

//   console.log(record.id); // 123
//   console.log(record.value.name); // "dblite"
//   console.log(record.value.rate); // "awesome""
// });

