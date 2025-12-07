const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname)); // Serve the HTML/CSS files

// --- MOCK DATABASE (In-Memory Storage) ---
// In a real app, this would be MongoDB or SQL
let users = [];       
let posts = [];       

// Helper to generate random IDs
const generateId = () => Math.floor(Math.random() * 10000);

// --- ROUTES ---

// 1. Register User
app.post('/register', (req, res) => {
    const { username, password, bio } = req.body;
    if (users.find(u => u.username === username)) {
        return res.json({ success: false, message: "User already exists" });
    }
    const newUser = { id: generateId(), username, password, bio, following: [] };
    users.push(newUser);
    res.json({ success: true, message: "Registered successfully! Please login." });
});

// 2. Login User
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ success: true, user });
    } else {
        res.json({ success: false, message: "Invalid credentials" });
    }
});

// 3. Create a Post
app.post('/posts', (req, res) => {
    const { userId, content } = req.body;
    const newPost = { 
        id: generateId(), 
        userId, 
        content, 
        likes: [], 
        comments: [] 
    };
    posts.unshift(newPost); // Add to the top of the feed
    res.json({ success: true });
});

// 4. Get All Posts (Feed)
app.get('/posts', (req, res) => {
    // Add author names to posts before sending
    const feed = posts.map(p => {
        const author = users.find(u => u.id === p.userId);
        return { ...p, authorName: author ? author.username : "Unknown" };
    });
    res.json(feed);
});

// 5. Like a Post
app.post('/posts/like', (req, res) => {
    const { postId, userId } = req.body;
    const post = posts.find(p => p.id === postId);
    if (post && !post.likes.includes(userId)) {
        post.likes.push(userId);
    }
    res.json({ success: true });
});

// 6. Comment on a Post
app.post('/posts/comment', (req, res) => {
    const { postId, userId, text } = req.body;
    const post = posts.find(p => p.id === postId);
    const user = users.find(u => u.id === userId);
    if (post && user) {
        post.comments.push({ username: user.username, text });
        res.json({ success: true });
    }
});

// 7. Follow a User
app.post('/follow', (req, res) => {
    const { followerId, authorId } = req.body;
    const follower = users.find(u => u.id === followerId);
    if (follower && !follower.following.includes(authorId)) {
        follower.following.push(authorId);
        res.json({ success: true, message: "You are now following this user!" });
    } else {
        res.json({ success: false, message: "Already following." });
    }
});

// Start Server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});