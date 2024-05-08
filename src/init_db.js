const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Open the database in serialized mode
let db = new sqlite3.Database('./voting_system.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the voting_system database.');
    }
});

// Create a new table
db.run(`CREATE TABLE users(
    student_id TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL
)`, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Created the users table.');
    }
});

// Close the database connection
db.close((err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Closed the database connection.');
    }
});
