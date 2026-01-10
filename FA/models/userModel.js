const db = require('../db'); 

const User = {
    // Used for saving a new resident during signup
    create: async (userData) => {
        const query = `INSERT INTO users (email, password, reputation_rank, is_verified) VALUES (?,?, 0.5, FALSE)`;
        const values =;
        const [result] = await db.query(query, values);
        return result;
    },

    // Used for logging in a resident
    findByEmail: async (email) => {
        const query = `SELECT * FROM users WHERE email =?`;
        const [rows] = await db.query(query, [email]);
        // FIX: Returns the single user record found or undefined
        return rows; 
    }
};

module.exports = User;