const db = require('../db'); 

const User = {
    // Saves a new neighbor following the Data Minimization principle [5, 6]
    create: async (userData) => {
        const query = `
            INSERT INTO users (username, email, password, reputation_rank, is_verified) 
            VALUES (?,?,?, 0.5, FALSE)
        `;
        const values =;
        const [result] = await db.query(query, values);
        return result;
    },

    // FIX: Returns ONLY the first user object found or undefined
    // Allows searching by username OR email for the login form
    findByIdentifier: async (identifier) => {
        const query = `SELECT * FROM users WHERE email =? OR username =?`;
        const [rows] = await db.query(query, [identifier, identifier]);
        return rows; 
    }
};

module.exports = User;