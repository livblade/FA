const User = require('../models/userModel');

exports.register = async (req, res) => {
    const { email, password, confirm_password } = req.body;
    if (!email) return res.status(400).send("Email is required.");
    if (!password) return res.status(400).send("Password is required.");
    if (password!== confirm_password) return res.status(400).send("Passwords do not match.");

    try {
        await User.create({ email, password });
        res.redirect('/login');
    } catch (err) {
        console.error("REGISTRATION ERROR:", err);
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).send("Email already exists.");
        res.status(500).send("Internal Error. Ensure schema.sql was run.");
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findByEmail(email);

        // Verification logic without | | symbols for stability
        if (!user) {
            return res.status(401).send("Invalid email or password.");
        }
        if (user.password!== password) {
            return res.status(401).send("Invalid email or password.");
        }

        // On success, redirect to Discovery dashboard
        res.redirect('/tasks');
    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).send("Login failed. Check server connection.");
    }
};