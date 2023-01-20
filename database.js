const mysql = require('mysql2');

const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
}).promise()

const checkUser = async (inputUsername, inputPassword) => {
    const [userInfo] = await pool.query("SELECT password FROM users WHERE username = ?", [inputUsername])
    const { password } = userInfo[0] || { password: "" };
    if (inputPassword === password) {
        return true;
    }
    return false;
}

const checkStage = async (stage) => {
    const [stageMasterInfo] = await pool.query("SELECT * FROM stage_master WHERE stage = ?", [stage])
    return stageMasterInfo;
}

const getStageMaster = async () => {
    const stageMasterList = await pool.query("SELECT * FROM stage_master");
    return stageMasterList;
}

const insertStageMaster = async (stage, sort, status) => {
    const [insertionResult] = await pool.query(`
        INSERT INTO stage_master (stage, status, sort)
        VALUES
        (?, ?, ?);
    `, [stage, status, sort]);

    return insertionResult;
}

module.exports = {
    checkUser,
    checkStage,
    insertStageMaster,
    getStageMaster,
}