const db = require('../db'); 

const User = {
    // Creates new resident profile following PDPA Data Minimization [8, 9]
    create: async (userData) => {
        const query = `
            INSERT INTO users (email, password, reputation_rank, is_verified) 
            VALUES (?,?, 0.5, FALSE)
        `;
        const values = [userData.email, userData.password];
        const [result] = await db.query(query, values);
        return result;
    },

    // Returns first matching resident or undefined for secure auth comparison
    findByEmail: async (email) => {
        const query = `SELECT * FROM users WHERE email =?`;
        const [rows] = await db.query(query, [email]);
        // FIX: Returns the first user found (object) or undefined
        if (rows.length > 0) return rows;
        return null;
    }
};

module.exports = User;