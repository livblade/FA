const db = require('../db'); 

const User = {
    create: async (userData) => {
        const query = `
            INSERT INTO users (email, password, reputation_rank, is_verified) 
            VALUES (?,?, 0.5, FALSE)
        `;
        const values = [userData.email, userData.password];
        const [result] = await db.query(query, values);
        return result;
    },

    findByEmail: async (email) => {
        const query = `SELECT * FROM users WHERE email =?`;
        const [rows] = await db.query(query, [email]);
        // FIX: Returns the first user found (object) or undefined
        return rows; 
    }
};

module.exports = User;