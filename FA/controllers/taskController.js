// FIX: Removed broken '../models/address' reference
const Task = require('../models/taskModel');

exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.findAll();
        // Passes dynamic database results to the view
        res.render('tasks', { tasks });
    } catch (err) {
        console.error("Database Retrieval Error:", err);
        res.status(500).send("Database retrieval error. Ensure schema.sql was run.");
    }
};