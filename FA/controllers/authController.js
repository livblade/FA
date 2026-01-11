const User = require('../models/userModel');

exports.register = async (req, res) => {
    const { email, password, confirm_password } = req.body;
    if (!email ||!password) return res.status(400).send("Email and password are required.");
    if (password!== confirm_password) return res.status(400).send("Passwords do not match.");

    try {
        await User.create({ email, password });
        res.redirect('/login');
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).send("Email already registered.");
        res.status(500).send("Registration failure. Check schema.sql.");
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findByEmail(email);
        if (!user) return res.status(401).send("Invalid credentials.");
        if (user.password!== password) return res.status(401).send("Invalid credentials.");
        res.redirect('/tasks');
    } catch (err) {
        res.status(500).send("Login failed.");
    }
};