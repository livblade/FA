// ========================================
// Supermarket Management System - Main Application File
// ========================================

// Import required modules
require('dotenv').config();  // Load environment variables
const express = require('express');  // Express framework
const mysql = require('mysql2');  // MySQL database driver
const session = require('express-session');  // Session management
const flash = require('connect-flash');  // Flash messages
const multer = require('multer');  // File upload handling
const productController = require('./controllers/productControllers'); // Product controller (MVC)
const { DEFAULT_CATEGORY_OPTIONS } = require('./utils/categoryOptions');
const Wallet = require('./models/wallet'); // Wallet model

// Import middleware
const { checkAuthenticated, checkAdmin, validateRegistration, validateLogin } = require('./middleware');

const app = express();  // Express app instance

// ========================================
// File Upload Configuration (Multer)
// ========================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images'); // Save files here
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);  // Keep original name
    }
});
const upload = multer({ storage: storage });

// ========================================
// Database Connection (Shared DB)
// ========================================
const db = require('./db');  // Use shared database for all queries

// ========================================
// Express Configuration
// ========================================
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

// ========================================
// Session and Flash Middleware
// ========================================
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }
}));
app.use(flash());

// ========================================
// Import Controllers
// ========================================
const cartControllers = require('./controllers/cartControllers');
const orderControllers = require('./controllers/orderControllers');
const userControllers = require('./controllers/userControllers');
const shippingControllers = require('./controllers/shippingControllers');
const addressControllers = require('./controllers/addressControllers');
const walletControllers = require('./controllers/walletControllers');

// ========================================
// Routes
// ========================================

// Home Page
app.get('/', (req, res) => {
    const sql = 'SELECT * FROM products WHERE quantity > 0 ORDER BY category, id DESC';
    db.query(sql, (err, products) => {
        if (err) {
            console.error('Error fetching products:', err);
            return res.render('index', { user: req.session.user, productsByCategory: {}, categoryList: [] });
        }

        const productsByCategory = {};
        products.forEach(product => {
            const category = product.category || 'Uncategorized';
            if (!productsByCategory[category]) productsByCategory[category] = [];
            if (productsByCategory[category].length < 4) productsByCategory[category].push(product);
        });

        const fallbackTheme = { icon: '🛒', subtitle: 'Top picks for today', color: '#2563eb' };
        const categoryList = Object.keys(productsByCategory)
            .sort((a, b) => a.localeCompare(b))
            .map((name, index) => {
                const sanitized = name.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                const anchorId = sanitized ? `${sanitized}-section` : `category-${index}`;
                const theme = DEFAULT_CATEGORY_THEMES[name] || {};
                return {
                    key: name,
                    icon: theme.icon || fallbackTheme.icon,
                    title: theme.title || name,
                    subtitle: theme.subtitle || fallbackTheme.subtitle,
                    color: theme.color || fallbackTheme.color,
                    anchorId
                };
            });

        res.render('index', { user: req.session.user, productsByCategory, categoryList });
    });
});

// ========================================
// Registration Routes
// ========================================
app.get('/register', (req, res) => {
    res.render('register', {
        messages: req.flash('error'),
        formData: req.flash('formData')[0]
    });
});

app.post('/register', validateRegistration, (req, res) => {
    const { username, email, password, address, contact, role } = req.body;
    const checkSql = 'SELECT id FROM users WHERE email = ?';

    db.query(checkSql, [email], (checkErr, checkResults) => {
        if (checkErr) {
            console.error(checkErr);
            req.flash('error', 'System error, please try again.');
            req.flash('formData', req.body);
            return res.redirect('/register');
        }

        if (checkResults.length > 0) {
            req.flash('error', 'Email already registered');
            req.flash('formData', req.body);
            return res.redirect('/register');
        }

        const insertSql = 'INSERT INTO users (username, email, password, address, contact, role) VALUES (?, ?, SHA1(?), ?, ?, ?)';
        db.query(insertSql, [username, email, password, address, contact, role], (insertErr, result) => {
            if (insertErr) {
                console.error(insertErr);
                req.flash('error', 'Error creating user, please try again.');
                req.flash('formData', req.body);
                return res.redirect('/register');
            }

            Wallet.create(result.insertId, 0, (walletErr) => {
                if (walletErr) {
                    console.error('Error initializing wallet:', walletErr);
                    req.flash('error', 'Account created but wallet setup failed.');
                } else {
                    req.flash('success', 'Registration successful! Please log in.');
                }
                return res.redirect('/login');
            });
        });
    });
});

// ========================================
// Login/Logout Routes
// ========================================
app.get('/login', (req, res) => {
    res.render('login', {
        messages: req.flash('success'),
        errors: req.flash('error')
    });
});

app.post('/login', validateLogin, (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ? AND password = SHA1(?)';

    db.query(sql, [email, password], (err, results) => {
        if (err) {
            console.error(err);
            req.flash('error', 'System error, please try again.');
            return res.redirect('/login');
        }

        if (results.length === 0) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/login');
        }

        const user = results[0];
        req.session.user = user;
        req.flash('success', 'Login successful!');
        res.redirect(user.role === 'user' ? '/shopping' : '/inventory');
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// ========================================
// Keep all other routes unchanged
// ========================================
// Example: productController, cartControllers, orderControllers, shippingControllers, walletControllers
// Anywhere in the rest of your 643 lines where you had connection.query -> replace with db.query

// ========================================
// Start Server
// ========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));
