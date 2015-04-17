
// db.js

var mysql      = require('mysql');
var db = mysql.createConnection({
    // debug: true,
    host     : 's84.webhostingserver.nl',
    user     : 'deb40577_game',
    password : 'Gpw5KPrE',
    database: 'deb40577_game'
});


db.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('> connected as id ' + db.threadId);
});


db.query('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, userid TEXT, health INTEGER, score INTEGER, money INTEGER, useragent TEXT, value TEXT)',
function(err, result){
    // Case there is an error during the creation
    if(err) {
        console.log(err);
    } else {
        console.log("> Table users Created");
    }
});



// Only if you run d*b.js directly
checkIfUserExist ("dion");

function checkIfUserExist (userid) {
    global["rows_" + userid] = NaN;
    global["checkIfUserExist_" + userid] = false;

    db.query('SELECT * FROM users WHERE userid = ?', [userid], function(err, results) {
        global["rows_" + userid] = results;
        // console.log(results);
    });

    var refreshIntervalId = setInterval(function () {
        if (typeof global["rows_" + userid] == "object") {
            rows = global["rows_" + userid];

            var i = 0;
            Object.keys(rows).forEach(function(key) {
                // console.log(rows[key]);
                i++;
            });

            if (i == 1) {
                global["checkIfUserExist_" + userid] = true;
            };

            if (i > 1 ) {
                console.log("> XXXXXX  ERROR more than one user with the same name");
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

    db.query('SELECT id from users ORDER BY id DESC LIMIT 1', function (err, results) {
        console.log(results);

        latestid = results[0].id;
        console.log(latestid);

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
readScore("dion");

global["score"] = {};
global["health"] = {};
global["money"] = {};

function readScore (userid) {
    global["readScore_" + userid] = false;

    var refreshIntervalId = setInterval(function () {
        if (global["checkIfUserExist_" + userid]) {

            db.query('SELECT * FROM users WHERE userid = ?', [userid], function (err, rows) {
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
                console.log( global["score"][userid] );
                console.log( global["health"][userid] );
                console.log( global["money"][userid] );

            });

            clearInterval(refreshIntervalId);

        };
    },10)


}//e//readScore

// Read Score + on Login


// Write Score Read Score +1

// setTimeout( function () {
//         updatePoints ("score","dion");
// },40);


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








