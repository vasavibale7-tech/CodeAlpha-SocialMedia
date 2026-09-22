const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("socialmedia.db", (err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            content TEXT NOT NULL,
            likes INTEGER DEFAULT 0
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            username TEXT NOT NULL,
            comment TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS followers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            follower TEXT NOT NULL,
            following TEXT NOT NULL
        )
    `);
});

// Home
app.get("/", (req, res) => {
    res.json({
        message: "ConnectHub Social Media API is running!"
    });
});

// Register
app.post("/api/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required."
        });
    }

    db.run(
        `INSERT INTO users (username, password) VALUES (?, ?)`,
        [username, password],
        function(err) {
            if (err) {
                return res.status(400).json({
                    message: "Username already exists."
                });
            }

            res.json({
                message: "User registered successfully.",
                userId: this.lastID
            });
        }
    );
});

// Login
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;

    db.get(
        `SELECT id, username FROM users WHERE username = ? AND password = ?`,
        [username, password],
        (err, user) => {
            if (err) {
                return res.status(500).json({
                    message: "Database error."
                });
            }

            if (!user) {
                return res.status(401).json({
                    message: "Invalid username or password."
                });
            }

            res.json({
                message: "Login successful.",
                user
            });
        }
    );
});

// Create Post
app.post("/api/posts", (req, res) => {
    const { username, content } = req.body;

    if (!username || !content) {
        return res.status(400).json({
            message: "Username and content are required."
        });
    }

    db.run(
        `INSERT INTO posts (username, content) VALUES (?, ?)`,
        [username, content],
        function(err) {
            if (err) {
                return res.status(500).json({
                    message: "Could not create post."
                });
            }

            res.json({
                message: "Post created successfully.",
                postId: this.lastID
            });
        }
    );
});

// Get Posts
app.get("/api/posts", (req, res) => {
    db.all(
        `SELECT * FROM posts ORDER BY id DESC`,
        [],
        (err, posts) => {
            if (err) {
                return res.status(500).json({
                    message: "Could not fetch posts."
                });
            }

            res.json(posts);
        }
    );
});

// Like Post
app.post("/api/posts/:id/like", (req, res) => {
    const postId = req.params.id;

    db.run(
        `UPDATE posts SET likes = likes + 1 WHERE id = ?`,
        [postId],
        function(err) {
            if (err) {
                return res.status(500).json({
                    message: "Could not like post."
                });
            }

            res.json({
                message: "Post liked successfully."
            });
        }
    );
});

// Add Comment
app.post("/api/posts/:id/comments", (req, res) => {
    const postId = req.params.id;
    const { username, comment } = req.body;

    if (!username || !comment) {
        return res.status(400).json({
            message: "Username and comment are required."
        });
    }

    db.run(
        `INSERT INTO comments (post_id, username, comment) VALUES (?, ?, ?)`,
        [postId, username, comment],
        function(err) {
            if (err) {
                return res.status(500).json({
                    message: "Could not add comment."
                });
            }

            res.json({
                message: "Comment added successfully."
            });
        }
    );
});

// Get Comments
app.get("/api/posts/:id/comments", (req, res) => {
    const postId = req.params.id;

    db.all(
        `SELECT * FROM comments WHERE post_id = ? ORDER BY id ASC`,
        [postId],
        (err, comments) => {
            if (err) {
                return res.status(500).json({
                    message: "Could not fetch comments."
                });
            }

            res.json(comments);
        }
    );
});

// Follow User
app.post("/api/follow", (req, res) => {
    const { follower, following } = req.body;

    if (!follower || !following) {
        return res.status(400).json({
            message: "Follower and following are required."
        });
    }

    db.run(
        `INSERT INTO followers (follower, following) VALUES (?, ?)`,
        [follower, following],
        function(err) {
            if (err) {
                return res.status(500).json({
                    message: "Could not follow user."
                });
            }

            res.json({
                message: "User followed successfully."
            });
        }
    );
});

app.listen(PORT, () => {
    console.log(`ConnectHub server running at http://localhost:${PORT}`);
});