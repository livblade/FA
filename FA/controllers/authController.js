const User = require('../models/userModel');

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email in the c237_fa database
        const user = await User.findByEmail(email);

        // Verification logic
        if (!user |

| user.password!== password) {
            // In a production environment, use bcrypt.compare for secure password checking [1]
            return res.status(401).send("Invalid email or password. Please use the exact email you registered with.");
        }

        // REDIRECT: Sends the user to the Popular Services page after successful login
        console.log(`User ${email} logged in successfully. Redirecting to /tasks...`);
        res.redirect('/tasks');

    } catch (err) {
        console.error("Login System Error:", err);
        res.status(500).send("An error occurred during login. Please ensure schema.sql was run.");
    }
};

exports.register = async (req, res) => {
    const { email, password, confirm_password } = req.body;
    if (password!== confirm_password) return res.status(400).send("Passwords do not match.");
    try {
        await User.create({ email, password });
        res.redirect('/login');
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).send("Email already registered.");
        res.status(500).send("Registration failed.");
    }
};