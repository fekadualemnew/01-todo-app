const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3000;

// 1. Database Setup (Connecting using the service name 'db' as the hostname)
const pool = new Pool({
    host: 'db', // This connects to the 'db' service in docker-compose.yml!
    user: 'user',
    password: 'password',
    database: 'tododb',
    port: 5432
});

// Create table if it doesn't exist (Postgres uses SERIAL instead of AUTOINCREMENT)
pool.query(`CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY, 
    text TEXT, 
    status TEXT, 
    created_at TEXT
)`).catch(err => console.error(err));

// 2. Middleware
app.use(express.json());
app.use(express.static('public'));

// 3. ROUTES
app.get('/tasks', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM tasks ORDER BY created_at DESC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/tasks', async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Task text is empty" });
    const createdAt = new Date().toISOString();

    try {
        // Postgres uses $1, $2 for variables instead of ?
        const result = await pool.query(
            "INSERT INTO tasks (text, status, created_at) VALUES ($1, $2, $3) RETURNING id",
            [text, 'pending', createdAt]
        );
        res.json({ id: result.rows[0].id, text, status: 'pending', created_at: createdAt });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/tasks/:id', async (req, res) => {
    try {
        await pool.query("DELETE FROM tasks WHERE id = $1", [req.params.id]);
        res.json({ message: "deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/tasks/:id', async (req, res) => {
    const { text, status } = req.body;
    try {
        if (text) {
            await pool.query("UPDATE tasks SET text = $1 WHERE id = $2", [text, req.params.id]);
            res.json({ message: "text updated" });
        } else if (status) {
            await pool.query("UPDATE tasks SET status = $1 WHERE id = $2", [status, req.params.id]);
            res.json({ message: "status updated" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Start Server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});