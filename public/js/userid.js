  // // requires: md4.js

var plugins = "";
for (var i = 0; i < navigator.plugins.length; i++) {
	plugins = plugins + navigator.plugins[i].description;
};

var userLang = navigator.language || navigator.userLanguage; 

// var getCookies = function(){
//   var pairs = document.cookie.split(";");
//   var cookies = {};
//   for (var i=0; i<pairs.length; i++){
//     var pair = pairs[i].split("=");
//     cookies[pair[0]] = unescape(pair[1]);
//   }
//   return cookies;
// }

// var myCookies = getCookies();



var userid = String(navigator.userAgent)  + "," + String(plugins) + "," + navigator.systemLanguage + "," + userLang + "," + "colorDepth: " + screen.colorDepth + "," + navigator.doNotTrack + "," + navigator.product + ","  + navigator.appName + "," + navigator.cpuClass + "," + navigator.oscpu + "," + navigator.platform + "," + navigator.browserLanguage + ",";

var canvas = document.createElement("canvas");
canvas.style.display = "none";
canvas.id = "glcanvas";
document.body.appendChild(canvas);

var canvas = document.getElementById("glcanvas");
try {
	gl = canvas.getContext("experimental-webgl");
	gl.viewportWidth = canvas.width;
	gl.viewportHeight = canvas.height;
} catch (e) { }
if (!gl) {
	userid += "Could not initialise WebGL.";
} 
else {
	var webglinfo = "Version: " + gl.getParameter(gl.VERSION) + '<br/>';
	webglinfo += "Shading language: " + gl.getParameter(gl.SHADING_LANGUAGE_VERSION) + '<br/>';
	webglinfo += "Vendor: " + gl.getParameter(gl.VENDOR) + '<br/>';
	webglinfo += "Renderer: " + gl.getParameter(gl.RENDERER) + '<br/>';
    webglinfo += "Unmasked vendor: " + gl.getParameter(gl.UNMASKED_VENDOR_WEBGL) + '<br/>';
    webglinfo += "Unmasked renderer: " + gl.getParameter(gl.UNMASKED_RENDERER_WEBGL) + '<br/>';
    webglinfo += "Extensions: " + gl.getSupportedExtensions();

	userid += webglinfo;

}
console.log(navigator.buildID);


console.log(userid);

var userid = calcMD4(userid);
console.log(userid);


