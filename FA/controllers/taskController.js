const Task = require('../models/taskModel');

exports.getAllTasks = async (req, res) => {
    const { query } = req.query; // Capture search bar input
    try {
        let tasks;
        if (query) {
            tasks = await Task.search(query);
        } else {
            tasks = await Task.findAll();
        }
        res.render('tasks', { tasks, searchQuery: query || '' });
    } catch (err) {
        res.status(500).send("Retrieval Error.");
    }
};