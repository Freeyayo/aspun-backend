const mysql = require('mysql2');

const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
}).promise()

const checkUser = async (username, password) => {
    const res = await pool.query("SELECT password FROM users WHERE username = ?", [username])
    return res;
}

console.log(checkUser('admin').catch(e => console.log(e)))