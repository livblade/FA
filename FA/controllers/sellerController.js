const User = require('../models/userModel');

exports.onboard = async (req, res) => {
    const { email } = req.body;
    try {
        await User.updateToSeller(email);
        if (req.session.user) req.session.user.is_seller = true;
        res.redirect('/seller-dashboard');
    } catch (err) {
        res.status(500).send("Seller Onboarding Failed.");
    }
};

exports.getDashboard = (req, res) => {
    if (!req.session.user ||!req.session.user.is_seller) {
        return res.redirect('/become-seller');
    }
    res.render('seller-dashboard', { title: 'Manage Services' });
};