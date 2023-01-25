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

const checkCategory = async (category) => {
    const [categoryInfo] = await pool.query("SELECT * FROM category WHERE category = ?", [category])
    return categoryInfo;
}

const getStageMaster = async () => {
    const stageMasterList = await pool.query("SELECT * FROM stage_master");
    return stageMasterList;
}

const getStageMasterByIds = async (ids) => {
    const stageMasterList = await pool.query("SELECT * FROM stage_master WHERE id in (?)", [ids]);
    return stageMasterList;
}

const getCategory = async () => {
    const categoryList = await pool.query("SELECT * FROM category");
    return categoryList;
}

const getCategoryUserRoles = async () => {
    const categoryUserRolesList = await pool.query("SELECT * FROM category_user_roles");
    return categoryUserRolesList;
}

const getUserRoles = async () => {
    const userRoles = await pool.query("SELECT * FROM user_roles");
    return userRoles;
}

const getUserRoleById = async id => {
    const userRole = await pool.query("SELECT * FROM user_roles WHERE id = ?", [id]);
    return userRole;
}

const getUserRoleByIds = async ids => {
    const userRole = await pool.query("SELECT * FROM user_roles WHERE id in (?)", [ids]);
    return userRole;
}

const insertStageMaster = async (stage, sort, status) => {
    const [insertionResult] = await pool.query(`
        INSERT INTO stage_master (stage, status, sort)
        VALUES
        (?, ?, ?);
    `, [stage, status, sort]);

    return insertionResult;
}

const insertCategory = async (category, categoryid, stage_ids, parent_category_id, sort, status) => {
    const [insertionResult] = await pool.query(`
        INSERT INTO category (category_id, category, stage_ids, parent_category_id, sort, status)
        VALUES
        (?, ?, ?, ?, ?, ?);
    `, [categoryid, category, stage_ids, parent_category_id, sort, status]);

    return insertionResult;
}

const insertCategoryUserRoles = async (category, user_roles) => {
    const [insertionResult] = await pool.query(`
        INSERT INTO category_user_roles (category, user_roles_ids)
        VALUES
        (?, ?);
    `, [category, user_roles]);

    return insertionResult;
}

module.exports = {
    checkUser,
    checkStage,
    insertStageMaster,
    insertCategory,
    insertCategoryUserRoles,
    getStageMaster,
    getStageMasterByIds,
    checkCategory,
    getUserRoles,
    getUserRoleById,
    getUserRoleByIds,
    getCategory,
    getCategoryUserRoles,
}