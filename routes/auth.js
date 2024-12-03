// routes/auth.js
// routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../db_config');
const bcrypt = require('bcrypt');
const { ensureGuest } = require('../middleware/auth');

// 显示登录页面
router.get('/login', ensureGuest, (req, res) => {
    res.render('login', { error: null });
});

// 登录逻辑
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).render('login', { error: 'Email and password are required.' });
    }

    const query = 'SELECT * FROM User WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).render('login', { error: 'Invalid email or password.' });
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(400).render('login', { error: 'Invalid email or password.' });
        }

        // 登录成功
        req.session.user = { id: user.user_id, role: user.role };
        console.log('Login successful:', req.session.user);
        res.redirect('/');
    });
});

// 显示注册页面
router.get('/register', ensureGuest, (req, res) => {
    res.render('register', { error: null });
});

// 注册逻辑
router.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
        return res.status(400).render('register', { error: 'All fields are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).render('register', { error: 'Invalid email format.' });
    }

    if (password.length < 8) {
        return res.status(400).render('register', { error: 'Password must be at least 8 characters long.' });
    }

    const userRole = role === 'guest' ? 'guest' : 'guest';

    const checkQuery = 'SELECT * FROM User WHERE email = ? OR username = ?';
    db.query(checkQuery, [email, username], async (err, results) => {
        if (err) {
            return res.status(500).render('register', { error: 'Database error.' });
        }

        if (results.length > 0) {
            return res.status(400).render('register', { error: 'Email or username already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertQuery = `
            INSERT INTO User (username, email, password_hash, role, created_at)
            VALUES (?, ?, ?, ?, NOW())
        `;

        db.query(insertQuery, [username, email, hashedPassword, userRole], (err) => {
            if (err) {
                return res.status(500).render('register', { error: 'Registration failed.' });
            }
            res.redirect('/auth/login');
        });
    });
});

// 用户登出
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('An error occurred while logging out.');
        }
        // 清除客户端的 session cookie
        res.clearCookie('connect.sid');
        res.redirect('/auth/login'); // 登出后重定向到登录页面
    });
});

module.exports = router;
