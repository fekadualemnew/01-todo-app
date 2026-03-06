const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./todo.db');

db.serialize(() => {
    db.run("ALTER TABLE tasks ADD COLUMN created_at TEXT", (err) => {
        if (err) console.log("Column already exists or error: " + err.message);
        else console.log("Column added successfully.");
    });
});
db.close();