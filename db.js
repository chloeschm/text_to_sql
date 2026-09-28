const bettersqlite3 = require('better-sqlite3');
const db = new bettersqlite3('data/database.db', { verbose: console.log });

module.exports = db;