// nstore

// Load the library
var nStore = require('nstore');
// Create a store
var users = nStore.new('data/users.db', function () {
  // It's loaded now
});