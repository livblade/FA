const express = require('express');
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');
const taskController = require('./controllers/taskController');
const authController = require('./controllers/authController');
const sellerController = require('./controllers/sellerController');

dotenv.config();
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Setup for Logged-In State
app.use(session({
    secret: 'trustmate-hdb-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Pass session to all views for Navbar logic
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- ROUTES ---
app.get('/', (req, res) => res.render('index', { title: 'TRUSTMATE - Home' }));
app.get('/tasks', taskController.getAllTasks);
app.get('/login', (req, res) => res.render('login', { title: 'Login | TRUSTMATE' }));
app.get('/signup', (req, res) => res.render('signup', { title: 'Register | TRUSTMATE' }));
app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });

// Seller Flow
app.get('/become-seller', (req, res) => res.render('become-seller', { title: 'Become a Seller' }));
app.get('/seller-dashboard', sellerController.getDashboard);

// POST Actions
app.post('/auth/register', authController.register);
app.post('/auth/login', authController.login);
app.post('/seller/onboard', sellerController.onboard);

const PORT = 3000;
app.listen(PORT, () => console.log(`TRUSTMATE active on http://localhost:${PORT}`));