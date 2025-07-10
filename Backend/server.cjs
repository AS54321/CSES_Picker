const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const db = new sqlite3.Database('./cses.db');

app.use(cors());
app.use(bodyParser.json());

// Initialize DB table
db.run(`
  CREATE TABLE IF NOT EXISTS problem_status (
    id TEXT PRIMARY KEY,
    solved INTEGER DEFAULT 0,
    bookmarked INTEGER DEFAULT 0
  )
`);

// GET all statuses
app.get('/api/status', (req, res) => {
  db.all('SELECT * FROM problem_status', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const status = {};
    rows.forEach(row => {
      status[row.id] = {
        solved: !!row.solved,
        bookmarked: !!row.bookmarked
      };
    });
    res.json(status);
  });
});

// UPDATE status for a problem
app.post('/api/status', (req, res) => {
  const { id, solved, bookmarked } = req.body;
  db.run(`
    INSERT INTO problem_status (id, solved, bookmarked)
    VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      solved = COALESCE(excluded.solved, solved),
      bookmarked = COALESCE(excluded.bookmarked, bookmarked)
  `, [id, solved ? 1 : 0, bookmarked ? 1 : 0], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.listen(3001, () => {
  console.log('SQLite API running on http://localhost:3001');
});
