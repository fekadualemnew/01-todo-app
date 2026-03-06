const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// 1. Database Setup
const db = new sqlite3.Database('./todo.db');

db.serialize(() => {
    // Create the table with 'created_at' if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        text TEXT, 
        status TEXT, 
        created_at TEXT
    )`);
});

// 2. Middleware
app.use(express.json());
app.use(express.static('public'));

// 3. ROUTES

// GET: Load all tasks
app.get('/tasks', (req, res) => {
    db.all("SELECT * FROM tasks ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST: Add a new task
app.post('/tasks', (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Task text is empty" });

    const createdAt = new Date().toISOString(); // Get current time

    db.run("INSERT INTO tasks (text, status, created_at) VALUES (?, ?, ?)", 
        [text, 'pending', createdAt], 
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, text: text, status: 'pending', created_at: createdAt });
    });
});

// DELETE: Remove a task
app.delete('/tasks/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM tasks WHERE id = ?", [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "deleted" });
    });
});

// PUT: Update task (Status OR Text)
app.put('/tasks/:id', (req, res) => {
    const id = req.params.id;
    const { text, status } = req.body;

    if (text) {
        db.run("UPDATE tasks SET text = ? WHERE id = ?", [text, id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "text updated" });
        });
    } else if (status) {
        db.run("UPDATE tasks SET status = ? WHERE id = ?", [status, id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "status updated" });
        });
    }
});

// 4. Start Server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});