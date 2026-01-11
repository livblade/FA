const db = require('../db'); 

const User = {
    create: async (userData) => {
        const query = `INSERT INTO users (username, email, password) VALUES (?,?,?)`;
        const [result] = await db.query(query,);
        return result;
    },
    findByIdentifier: async (identifier) => {
        const query = `SELECT * FROM users WHERE email =? OR username =?`;
        const [rows] = await db.query(query, [identifier, identifier]);
        return rows || null;
    },
    updateToSeller: async (email) => {
        return await db.query('UPDATE users SET is_seller = TRUE, role = "seller" WHERE email =?', [email]);
    }
};
module.exports = User;