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

// Session Setup
app.use(session({
    secret: 'trustmate-hdb-market-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Syncing User Session with Views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Page Routes
app.get('/', (req, res) => res.render('index', { title: 'TRUSTMATE - Right Choice' }));
app.get('/tasks', taskController.getAllTasks);
app.get('/login', (req, res) => res.render('login', { title: 'Login | TRUSTMATE' }));
app.get('/signup', (req, res) => res.render('signup', { title: 'Register | TRUSTMATE' }));
app.get('/become-seller', (req, res) => res.render('become-seller', { title: 'Seller Onboarding' }));
app.get('/seller-dashboard', sellerController.getDashboard);
app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });

// Action Routes
app.post('/auth/register', authController.register);
app.post('/auth/login', authController.login);
app.post('/seller/onboard', sellerController.onboard);

const PORT = 3000;
app.listen(PORT, () => console.log(`TRUSTMATE running on http://localhost:${PORT}`));