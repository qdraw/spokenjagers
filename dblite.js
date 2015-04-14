var dblite = require('dblite'),
    db = dblite('file.sqlite');

db.query('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, userid TEXT, health INTEGER, score INTEGER, money INTEGER, value TEXT)');


checkIfUserExist ("dion's");

function checkIfUserExist (userid) {

	global["rows_" + userid] = NaN;

	db.query(
	  'SELECT * FROM users WHERE userid = ?',
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

			db.query(
			  'INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)',
			  [latestid, userid, 100, 0, 0, null]
			);

			clearInterval(refreshIntervalId);

		}
	},10)

}



// Read Score + on Login


// Write Score Read Score +1









	
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


	console.log("----");



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

