const User = require('../models/userModel');

exports.register = async (req, res) => {
    const { username, email, password, confirm_password } = req.body;
    if (password!== confirm_password) return res.status(400).send("Passwords mismatch.");
    try {
        await User.create({ username, email, password });
        res.redirect('/login');
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).send("User already exists.");
        res.status(500).send("Registration failure.");
    }
};

exports.login = async (req, res) => {
    const { identifier, password } = req.body;
    try {
        const user = await User.findByIdentifier(identifier);
        
        // Logic check for Admin Role or standard members
        if (!user |

| user.password!== password) {
            return res.status(401).send("Invalid credentials.");
        }
        
        req.session.user = { id: user.id, username: user.username, role: user.role, is_seller: user.is_seller };
        res.redirect('/tasks');
    } catch (err) {
        res.status(500).send("Login system error.");
    }
};