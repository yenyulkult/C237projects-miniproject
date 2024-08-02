const express = require('express');
const app = express();
const mysql = require('mysql2');
const port = 3000;

app.set('view engine', 'ejs');

// Create MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'note'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Middleware
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  const sql = 'SELECT * FROM notes ORDER BY created_at DESC';
  connection.query(sql, (error, rows) => {
    if (error) {
      console.error('Error fetching notes:', error);
      res.status(500).send('Error fetching notes');
    } else {
      res.render('index', { notes: rows });
    }
  });
});

app.get('/note/:id', (req, res) => {
  const noteId = req.params.id;
  const sql = 'SELECT * FROM notes WHERE noteId = ?';
  connection.query(sql, [noteId], (error, results) => {
    if (error) {
      console.error('Database query error:', error.message);
      return res.status(500).send('Error retrieving note by ID');
    }
    if (results.length > 0) {
      res.render('note', { note: results[0] });
    } else {
      res.status(404).send('Note not found');
    }
  });
});

app.get('/add', (req, res) => {
  res.render('add');
});

app.post('/add', (req, res) => {
  const { title, content } = req.body;
  const createdAt = new Date();
  const sql = 'INSERT INTO notes (title, content, created_at) VALUES (?, ?, ?)';
  connection.query(sql, [title, content, createdAt], (error, results) => {
    if (error) {
      console.error('Error adding note:', error);
      res.status(500).send('Error adding note');
    } else {
      res.redirect('/');
    }
  });
});

app.get('/edit/:id', (req, res) => {
  const noteId = req.params.id;
  const sql = 'SELECT * FROM notes WHERE noteId = ?';
  connection.query(sql, [noteId], (error, rows) => {
    if (error) {
      console.error('Error fetching note:', error);
      res.status(500).send('Error fetching note');
    } else {
      res.render('edit', { note: rows[0] });
    }
  });
});

app.post('/edit/:id', (req, res) => {
  const noteId = req.params.id;
  const { title, content } = req.body;
  const sql = 'UPDATE notes SET title = ?, content = ? WHERE noteId = ?';
  connection.query(sql, [title, content, noteId], (error, results) => {
    if (error) {
      console.error("Error updating note:", error);
      res.status(500).send('Error updating note');
    } else {
      res.redirect('/');
    }
  });
});

app.get('/delete/:id', (req, res) => {
  const noteId = req.params.id;
  const sql = 'DELETE FROM notes WHERE noteId = ?';
  connection.query(sql, [noteId], (error, results) => {
    if (error) {
      console.error("Error deleting note:", error);
      res.status(500).send('Error deleting note');
    } else {
      res.redirect('/');
    }
  });
});



// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
