require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Database
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

// Middleware
app.use(cors({
    origin: ['http://localhost:3001', 'https://www.meximcoltd.com', 'https://meximcoltd.com', 'http://www.meximcoltd.com', 'http://meximcoltd.com'],
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '..')));
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));

// Ensure uploads folder
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
['blogs', 'team'].forEach(sub => {
    const d = path.join(uploadsDir, sub);
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const type = req.params.type || 'general';
        const dir = path.join(uploadsDir, type);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Auth middleware
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (e) {
        res.status(401).json({ error: 'Invalid token' });
    }
}

// ==================== AUTH ====================
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
        return res.json({ token, email });
    }
    res.status(401).json({ error: 'Invalid credentials' });
});

app.get('/api/verify', authMiddleware, (req, res) => {
    res.json({ valid: true, user: req.user });
});

// ==================== MESSAGES (Contact form) ====================
// Public: submit message from contact form
app.post('/api/messages', async (req, res) => {
    try {
        const { name, company, email, interest, message } = req.body;
        const result = await pool.query(
            'INSERT INTO messages (name, company, email, interest, message) VALUES ($1,$2,$3,$4,$5) RETURNING *',
            [name, company, email, interest, message]
        );
        res.json({ success: true, message: 'Message sent successfully!' });
    } catch (e) {
        console.error('Message error:', e);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Admin: list messages
app.get('/api/messages', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Admin: update message status
app.patch('/api/messages/:id', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        await pool.query('UPDATE messages SET status=$1 WHERE id=$2', [status, req.params.id]);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to update message' });
    }
});

// Admin: delete message
app.delete('/api/messages/:id', authMiddleware, async (req, res) => {
    try {
        await pool.query('DELETE FROM messages WHERE id=$1', [req.params.id]);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

// ==================== BLOGS ====================
// Public: list published blogs
app.get('/api/blogs', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM blogs ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch blogs' });
    }
});

// Admin: create blog
app.post('/api/blogs', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { title, category, excerpt, content, author } = req.body;
        const image_url = req.file ? `/uploads/general/${req.file.filename}` : null;
        const result = await pool.query(
            'INSERT INTO blogs (title, category, image_url, excerpt, content, author) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
            [title, category, image_url, excerpt, content, author || 'Admin']
        );
        res.json(result.rows[0]);
    } catch (e) {
        console.error('Blog create error:', e);
        res.status(500).json({ error: 'Failed to create blog' });
    }
});

// Admin: update blog
app.put('/api/blogs/:id', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { title, category, excerpt, content, author } = req.body;
        let image_url = req.body.existing_image;
        if (req.file) image_url = `/uploads/general/${req.file.filename}`;
        await pool.query(
            'UPDATE blogs SET title=$1, category=$2, image_url=$3, excerpt=$4, content=$5, author=$6 WHERE id=$7',
            [title, category, image_url, excerpt, content, author, req.params.id]
        );
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to update blog' });
    }
});

// Admin: delete blog
app.delete('/api/blogs/:id', authMiddleware, async (req, res) => {
    try {
        await pool.query('DELETE FROM blogs WHERE id=$1', [req.params.id]);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to delete blog' });
    }
});

// ==================== TEAM ====================
// Public: list team members
app.get('/api/team', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM team_members ORDER BY order_index ASC');
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch team' });
    }
});

// Admin: add team member
app.post('/api/team', authMiddleware, upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'cv', maxCount: 1 }
]), async (req, res) => {
    try {
        const { name, role, bio, order_index } = req.body;
        const photo_url = req.files?.photo?.[0] ? `/uploads/general/${req.files.photo[0].filename}` : null;
        const cv_url = req.files?.cv?.[0] ? `/uploads/general/${req.files.cv[0].filename}` : null;
        const result = await pool.query(
            'INSERT INTO team_members (name, role, bio, photo_url, cv_url, order_index) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
            [name, role, bio, photo_url, cv_url, parseInt(order_index) || 0]
        );
        res.json(result.rows[0]);
    } catch (e) {
        console.error('Team create error:', e);
        res.status(500).json({ error: 'Failed to add team member' });
    }
});

// Admin: update team member
app.put('/api/team/:id', authMiddleware, upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'cv', maxCount: 1 }
]), async (req, res) => {
    try {
        const { name, role, bio, order_index } = req.body;
        let photo_url = req.body.existing_photo;
        let cv_url = req.body.existing_cv;
        if (req.files?.photo?.[0]) photo_url = `/uploads/general/${req.files.photo[0].filename}`;
        if (req.files?.cv?.[0]) cv_url = `/uploads/general/${req.files.cv[0].filename}`;
        await pool.query(
            'UPDATE team_members SET name=$1, role=$2, bio=$3, photo_url=$4, cv_url=$5, order_index=$6 WHERE id=$7',
            [name, role, bio, photo_url, cv_url, parseInt(order_index) || 0, req.params.id]
        );
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to update team member' });
    }
});

// Admin: delete team member
app.delete('/api/team/:id', authMiddleware, async (req, res) => {
    try {
        await pool.query('DELETE FROM team_members WHERE id=$1', [req.params.id]);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to delete team member' });
    }
});

// ==================== FILE UPLOAD ====================
app.post('/api/upload/:type', authMiddleware, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ url: `/uploads/${req.params.type}/${req.file.filename}` });
});

// ==================== STATS ====================
app.get('/api/stats', authMiddleware, async (req, res) => {
    try {
        const msgs = await pool.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status=\'unread\') as unread FROM messages');
        const blogs = await pool.query('SELECT COUNT(*) as total FROM blogs');
        const team = await pool.query('SELECT COUNT(*) as total FROM team_members');
        res.json({
            messages: { total: parseInt(msgs.rows[0].total), unread: parseInt(msgs.rows[0].unread) },
            blogs: parseInt(blogs.rows[0].total),
            team: parseInt(team.rows[0].total)
        });
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Start
app.listen(PORT, () => {
    console.log(`\n🍄 MEXIMCO Admin Server running on http://localhost:${PORT}`);
    console.log(`📊 Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`🌐 Website: http://localhost:${PORT}\n`);
});
