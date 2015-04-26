
var   mysql             =       require('mysql')
    , fs                =       require('fs')
    , config            =       require('./configuration/config');


//Define MySQL parameter in Config.js file.
var connection = mysql.createConnection({
    host         : config.host,
    user         : config.username,
    password : config.password,
    database : config.database
});

var userList = [];
var writeAppendData = false;

connection.query("SELECT * from locations",function(err,rows,fields){
if(err) throw err;

    for (var i = 0; i < rows.length; i++) {

        Object.keys(rows[i]).forEach(function(key) {
            var userid = key; // _userid_
            userList.push(userid);
        });

    };

    for (var i = 0; i < userList.length; i++) {
        var userid = userList[i];
        var logfilename = "logs/" + userid + ".gpx";
        var prevAppendData = '<?xml version="1.0" encoding="UTF-8" ?>' + "\n" + '<gpx xmlns="http://www.topografix.com/GPX/1/1" version="1.1" creator="Qdraw" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd ">' + "\n" + "<trk>" +"\n" + "<name>Qdraw " + userid + "</name> \n <trkseg> \n\n";
      
        fs.writeFile(logfilename, prevAppendData, function (err) {
        }); 
    };

    for (var i = 0; i < rows.length; i++) {

        Object.keys(rows[i]).forEach(function(key) {

            var userid = key; // _userid_

            if (rows[i][key] != 0 && rows[i][key] != null && isNaN(rows[i][key]) ) {


                var logfilename = "logs/" + userid + ".gpx";


                // The actual writing
                var appendDataArray = rows[i][key].split(";"); 
                // console.log(appendDataArray)
                
                var appendData = '<trkpt lat="'+ appendDataArray[0] +'" lon="'+ appendDataArray[1] +'">' + "\n" + "<ele>" + appendDataArray[2] + "</ele>\n" + "<time>"  + appendDataArray[3] +  "</time>" + "\n<extensions>\n<speed>" + appendDataArray[4] +"</speed>\n</extensions>\n"+ "</trkpt> \n";
                // console.log(appendData);
                
                fs.appendFile(logfilename, appendData, function (err) {
                }); 
                //e/writ

            };

        });

        if (rows.length-1 === i ) {
            console.log("hi");
            writeAppendData = true;
        };

    };

// var prevAppendData = '<?xml version="1.0" encoding="UTF-8" ?>' + "\n" + '<gpx xmlns="http://www.topografix.com/GPX/1/1" version="1.1" creator="Qdraw" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd ">' + "\n" + "<trk>" +"\n" + "<name>Qdraw " + userid + "</name> \n <trkseg> \n\n";
    //                 var afterAppendData = "</trkseg></trk></gpx>";




});

setInterval(function () {
    if (writeAppendData) {

        for (var i = 0; i < userList.length; i++) {
            var userid = userList[i];
            var logfilename = "logs/" + userid + ".gpx";
            var afterAppendData = "</trkseg></trk></gpx>";

            fs.appendFile(logfilename, afterAppendData, function (err) {
            }); 
        };

        connection.query("DELETE FROM locations WHERE id BETWEEN 0 AND 999999999999999999");
        writeAppendData  = false;

        console.log("end")
        process.exit(code=0);

    };
},10);




// if (userid != 0) {
//     try {
//         if ((userData[c][userid][0] != 0) && (userData[c][userid][0] != undefined)) {
//             var lat = userData[c][userid][0];
//         };
//         if ((userData[c][userid][1] != 0) && (userData[c][userid][1] != undefined)) {
//             var lng = userData[c][userid][1];
//             var altitude = userData[c][userid][3];
//             var speed = userData[c][userid][4];

//             if (altitude === 0 || altitude == undefined) {
//                 altitude = -1000;
//             };

//             if (speed ===  null) {
//                 speed = 0;
//             };

//             var myDate = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
//             var today = new Date().toJSON().slice(0,10);

//             var logfilename = "logs/" + userid + ".srcgpx";

//             var appendData = '<trkpt lat="'+ lat +'" lon="'+ lng +'">' + "\n" + "<ele>" + altitude + "</ele>\n" + "<time>" + today + "T" + myDate + "Z" +"</time>" + "\n<extensions>\n<speed>" + speed +"</speed>\n</extensions>\n"+ "</trkpt> \n";
//             var appendData = appendData;

//             if ( (lat != 0) && (lng != 0 ) && (userid != 0 )) {
//                 fs.appendFile(logfilename, appendData, function (err) {
//                 });                    
//             };
//         };

//     }
//     catch(e) {
//         console.log("srcgpx writer fails under: " + userid);
//     }
// };///e/userid
