const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const taskController = require('./controllers/taskController');

dotenv.config();
const app = express();

// Set public as static folder - this is CRITICAL for loading styles.css
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// TRUSTMATE Routes
app.get('/', (req, res) => res.render('index', { title: 'TRUSTMATE - Right Choice' }));
app.get('/tasks', taskController.getAllTasks);
app.get('/login', (req, res) => res.render('login', { title: 'Login | TRUSTMATE' }));

const PORT = 3000;
app.listen(PORT, () => console.log(`TRUSTMATE running on http://localhost:${PORT}`));