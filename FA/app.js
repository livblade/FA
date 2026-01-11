const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const taskController = require('./controllers/taskController');
const authController = require('./controllers/authController');

dotenv.config();
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => res.render('index', { title: 'TRUSTMATE - Home' }));
app.get('/tasks', taskController.getAllTasks);
app.get('/login', (req, res) => res.render('login', { title: 'Login | TRUSTMATE' }));
app.get('/signup', (req, res) => res.render('signup', { title: 'Register | TRUSTMATE' }));

app.post('/auth/register', authController.register);
app.post('/auth/login', authController.login);

const PORT = 3000;
app.listen(PORT, () => console.log(`TRUSTMATE active on http://localhost:${PORT}`));