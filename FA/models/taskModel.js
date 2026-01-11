const db = require('../db'); 

const Task = {
    findAll: async () => {
        const query = `SELECT tasks.*, users.reputation_rank, users.is_verified FROM tasks JOIN users ON tasks.requester_id = users.id WHERE tasks.status = 'open' ORDER BY tasks.created_at DESC`;
        const [rows] = await db.query(query);
        return rows;
    },
    search: async (term) => {
        const query = `SELECT tasks.*, users.reputation_rank, users.is_verified FROM tasks JOIN users ON tasks.requester_id = users.id WHERE (tasks.description LIKE? OR tasks.category LIKE?) AND tasks.status = 'open'`;
        const [rows] = await db.query(query, [`%${term}%`, `%${term}%`]);
        return rows;
    }
};
module.exports = Task;