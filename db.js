const mysql = require('mysql2'); // or mysql if using that

const connection = mysql.createConnection({
  host: '192.168.1.8',        // your server IP
  user: 'shared_user',         // the shared user
  password: 'strongpassword',  // the password
  database: 'shared_db'        // your shared database
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting: ' + err.stack);
    return;
  }
  console.log('Connected to shared database as id ' + connection.threadId);
});

module.exports = connection;
