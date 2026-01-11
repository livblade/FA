const Task = require('../models/taskModel');

exports.getAllTasks = async (req, res) => {
    const { query } = req.query; // Matches search input name
    try {
        let tasks = query? await Task.search(query) : await Task.findAll();
        res.render('tasks', { tasks });
    } catch (err) {
        res.status(500).send("Database retrieval error.");
    }
};