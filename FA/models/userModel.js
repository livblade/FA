const db = require('../db'); 

const User = {
    create: async (userData) => {
        const query = `INSERT INTO users (username, email, password, reputation_rank, is_verified) VALUES (?,?,?, 0.5, FALSE)`;
        const values = [userData.username, userData.email, userData.password];
        const [result] = await db.query(query, values);
        return result;
    },
    // FIX: Returns the first user object found or null
    findByIdentifier: async (identifier) => {
        const query = `SELECT * FROM users WHERE email =? OR username =?`;
        const [rows] = await db.query(query, [identifier, identifier]);
        if (rows.length > 0) return rows;
        return null;
    }
};

module.exports = User;