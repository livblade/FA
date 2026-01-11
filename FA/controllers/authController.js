const User = require('../models/userModel');

exports.register = async (req, res) => {
    const { username, email, password, confirm_password } = req.body;

    if (!username ||!email ||!password) return res.status(400).send("All fields are required.");
    if (password!== confirm_password) return res.status(400).send("Passwords do not match.");

    try {
        await User.create({ username, email, password });
        res.redirect('/login');
    } catch (err) {
        console.error("REGISTRATION ERROR:", err);
        // Handle unique constraint violations
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).send("Registration failed: Username or Email already exists.");
        }
        res.status(500).send("Registration failed. Ensure your database is up to date.");
    }
};

exports.login = async (req, res) => {
    const { identifier, password } = req.body; // identifier can be username or email

    try {
        const user = await User.findByIdentifier(identifier);

        // Nested if-statements for stability across all browsers
        if (!user) {
            return res.status(401).send("Invalid username/email or password.");
        }
        if (user.password!== password) {
            return res.status(401).send("Invalid username/email or password.");
        }

        // On success, transition to hyper-local discovery
        res.redirect('/tasks');
    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).send("Login failed. Check server connection.");
    }
};