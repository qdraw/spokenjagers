#!/usr/bin/env node

var sqlite3 = require('sqlite3').verbose();
var dbname = "server.sqlite"
var db = new sqlite3.Database(dbname);  //':memory:'


var runQuery = function(request) {
    var select = 'select rowid AS id, firstName, lastName from country where ',
        query,
        params = []; 

    if (request.first && request.last) {
        query = select + "firstName=? and lastName=?"
        params.push( request.first, request.last );
    } else if (request.first) {
        query = select + "firstName=?"
        params.push( request.first );
    } else if (request.last) {
        query = select + "lastName=?"
        params.push( request.last );
    }   

    if (request.address) {
        params.push( request.address );

        if (!query) {
            query = select + " address like ?"; 
        } else {
            query = query + " and address like ?"; 
        }   
    }   

    db.each( query, params, function(err, row) {
        console.log( 'id:', row.id, row.firstName, row.lastName );

    }); 
};

var createTestData = function() {

    var stmt = db.prepare('insert into country values (?, ?, ?)');

    stmt.run('john', 'smith', '123 state street');
    stmt.run('jane', 'doe', '400 doe street');
    stmt.run('jeff', 'lebowski', 'dude ave, dudeville');

    stmt.finalize();
};

db.serialize(function() {
    db.run('create table if not exists country( firstName text, lastName text, address text )');
    // createTestData();

    var searches = [ 
        { first:'john', last:'smith' },
        { first:'jane' },
        { last:'lebowski' },
        { address:'%street%' }
    ];  

    searches.forEach(function(request) {
        runQuery( request );
    }); 
});

db.close();



// userid = "dion";


// 	db.serialize(function() {
// 	    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, userid TEXT, score TEXT, health TEXT, date TEXT, isdeleted INTEGER)");

// 	    	db.get("SELECT * FROM users WHERE userid='" + userid + "'", function(err, row) {
// 	    		try {
// 	    			var id = row.id;
// 	    		}catch(e){
// 	    			var id = -1;
// 	    		}

// 	    		if (id < 0) {
//    				  	var stmt = db.prepare("INSERT OR IGNORE INTO users(userid) VALUES (?)");
// 		  			stmt.run(userid);
// 				  	stmt.finalize();
// 	    		}

// 	    		console.log(id);
// 	    		// console.log(row.userid);
// 	    		// global["q"] = row.userid;
// 	    		// // if (row.userid == userid) {
// 		    	// 	console.log(row.id);
// 	    		// };
// 	    	});

// 			// db.each("SELECT * FROM users WHERE userid='" + userid + "'", function(err, row) {
// 			// 	userIDs.push(row.id,row.userid);
// 		 //    	console.log(row.id + ": " + row.userid);
// 			// });  


// 	});
	 
// 	db.close();


	 //  	function checkUserid (userid) {
	 //  		var userIDs = [];
	
		//   	console.log(userIDs);
		// 	return userIDs;
	 //  	}//e/e/checkUserid

	 //  	var useridData;
		// useridData = checkUserid(userid);

	 //  	console.log(useridData)

			// db.each("SELECT id, userid FROM users", function(err, row) {

		 //  		if (row.userid == userid) {
		 //  			global["useridData_"+ userid] = "how hard can it be";
		 //  		}//e/efoi
		 //  	});







	  	// if (!useridData.isuserid) {

	  	// 	checkUserid (userid);
		  // 	console.log(useridData);
	  	// };
	 
	  // var stmt = db.prepare("INSERT OR IGNORE INTO users(userid) VALUES (?)");
	  // stmt.run(userid);
	  // stmt.finalize();
 
	  // db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
	  //     console.log(row.id + ": " + row.info);
	  // });

// function checkIfUserRegisteredInDB (userid) {


// // return true or false
// }//e/checkIfUserRegisteredInDB


// addNewUserToDB ("dionwjkfnskldfnsdlkfndsklfndsl");


// function addNewUserToDB (userid) {
// 	db.serialize(function() {  
// 	  	db.run("CREATE TABLE IF NOT EXISTS users (id INT, userid TEXT, score TEXT, health TEXT)");  
// 	  	var stmt = db.prepare("INSERT INTO userid VALUES (?,?)");  
// 		stmt.run(userid);  
// 	  	stmt.finalize();  
// 	});  
// 	db.close(); 
// }//e/addNewUserToDB




  

// db.serialize(function() {  
//   db.run("CREATE TABLE users (id INT, userid TEXT)");  
  
//   var stmt = db.prepare("INSERT INTO userid VALUES (?,?)");  
//   for (var i = 0; i < 10; i++) {  
// 	  var d = new Date();  
// 	  var n = d.toLocaleTimeString();  
// 	  stmt.run(i, n);  
//   }  
//   stmt.finalize();  
  
//   db.each("SELECT id, dt FROM users", function(err, row) {  
//       console.log("User id : "+row.id, row.dt);  
//   });  
// });  
  
// db.close(); 