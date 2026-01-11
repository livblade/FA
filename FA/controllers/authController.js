const User = require('../models/userModel');

exports.register = async (req, res) => {
    const { username, email, password, confirm_password } = req.body;
    if (password!== confirm_password) return res.status(400).send("Passwords do not match.");

    try {
        await User.create({ username, email, password });
        res.redirect('/login');
    } catch (err) {
        console.error("REGISTRATION ERROR:", err);
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).send("Username or Email already registered.");
        res.status(500).send("Registration failed. Check database connection.");
    }
};

exports.login = async (req, res) => {
    const { identifier, password } = req.body; // Supports username OR email
    try {
        const user = await User.findByIdentifier(identifier);

        // Verification logic using separate checks for stability
        if (!user) return res.status(401).send("Invalid credentials.");
        if (user.password!== password) return res.status(401).send("Invalid credentials.");

        // REDIRECT: Once logged in, go to discovery dashboard
        res.redirect('/tasks');
    } catch (err) {
        res.status(500).send("Login failure. Ensure schema.sql was run.");
    }
};