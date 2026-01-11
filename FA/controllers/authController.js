const User = require('../models/userModel');

exports.register = async (req, res) => {
    const { email, password, confirm_password } = req.body;
    if (!email ||!password) return res.status(400).send("Email and password are required.");
    if (password!== confirm_password) return res.status(400).send("Passwords do not match.");

    try {
        await User.create({ email, password });
        res.redirect('/login');
    } catch (err) {
        console.error("REGISTRATION ERROR:", err);
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).send("Email already registered.");
        res.status(500).send("Registration failed. Ensure schema.sql was run.");
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findByEmail(email);

        // Verification logic without logical OR symbols
        if (!user) {
            return res.status(401).send("Invalid email or password.");
        }
        if (user.password!== password) {
            return res.status(401).send("Invalid email or password.");
        }

        // On success, redirect to the discovery dashboard
        res.redirect('/tasks');
    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).send("Internal login failure. Check database connection.");
    }
};