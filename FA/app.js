const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const taskController = require('./controllers/taskController');
const authController = require('./controllers/authController');

dotenv.config();
const app = express();

<<<<<<< HEAD
// Serving static files is CRITICAL for styles.css and images to load
=======
>>>>>>> 192c2fff3be2bfa362c35ddfbb681e55c2e2ec9c
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

<<<<<<< HEAD
// TRUSTMATE Page Rendering (GET)
app.get('/', (req, res) => res.render('index', { title: 'TRUSTMATE - Home' }));
=======
app.get('/', (req, res) => res.render('index', { title: 'TRUSTMATE - Right Choice' }));
>>>>>>> 192c2fff3be2bfa362c35ddfbb681e55c2e2ec9c
app.get('/tasks', taskController.getAllTasks);
app.get('/login', (req, res) => res.render('login', { title: 'Login | TRUSTMATE' }));
app.get('/signup', (req, res) => res.render('signup', { title: 'Register | TRUSTMATE' }));

<<<<<<< HEAD
// Auth Logic (POST)
=======
>>>>>>> 192c2fff3be2bfa362c35ddfbb681e55c2e2ec9c
app.post('/auth/register', authController.register);
app.post('/auth/login', authController.login);

const PORT = 3000;
<<<<<<< HEAD
app.listen(PORT, () => console.log(`TRUSTMATE frame active on http://localhost:${PORT}`));
=======
app.listen(PORT, () => console.log(`TRUSTMATE active on http://localhost:${PORT}`));
>>>>>>> 192c2fff3be2bfa362c35ddfbb681e55c2e2ec9c
