const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Open the database connection
let db = new sqlite3.Database('./voting_system.db', (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to the voting_system database.');
    }
});

const createUser = (studentId, password) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, function(err, hash) {
            if (err) {
                reject(err);
            } else {
                db.run('INSERT INTO users (student_id, password_hash) VALUES (?, ?)', [studentId, hash], function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(`A new user has been added with the ID ${studentId}`);
                    }
                });
            }
        });
    });
};

const authenticateUser = (studentId, password) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT password_hash FROM users WHERE student_id = ?', [studentId], function(err, row) {
            if (err) {
                reject(err);
            } else if (row) {
                bcrypt.compare(password, row.password_hash, function(err, result) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            } else {
                // No user found with that ID
                resolve(false);
            }
        });
    });
};

module.exports = { createUser, authenticateUser };
