  // // requires: md4.js

var plugins = "";
for (var i = 0; i < navigator.plugins.length; i++) {
	plugins = plugins + navigator.plugins[i].description;
};

var userLang = navigator.language || navigator.userLanguage; 


var getCookies = function(){
  var pairs = document.cookie.split(";");
  var cookies = {};
  for (var i=0; i<pairs.length; i++){
    var pair = pairs[i].split("=");
    cookies[pair[0]] = unescape(pair[1]);
  }
  return cookies;
}

var myCookies = getCookies();

var userid = calcMD4(String(navigator.userAgent)  + String(plugins) + userLang + screen.colorDepth );
console.log(userid);


