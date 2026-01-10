const db = require('../db'); 

const Task = {
    // Fetches all open tasks and their provider's status
    findAll: async () => {
        const query = `
            SELECT tasks.*, users.reputation_rank, users.is_verified
            FROM tasks
            JOIN users ON tasks.requester_id = users.id
            WHERE tasks.status = 'open'
            ORDER BY tasks.created_at DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    }
};

module.exports = Task;