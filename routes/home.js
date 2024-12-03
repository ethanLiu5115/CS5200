// routes/home.js
const express = require('express');
const router = express.Router();
const db = require('../db_config');

// 主页路由
router.get('/', (req, res) => {
    db.query('SELECT * FROM Movie ORDER BY release_date DESC LIMIT 5', (err, results) => {
        if (err) {
            console.error('Error fetching recent movies:', err);
            res.status(500).send('Error fetching recent movies');
        } else {
            res.render('home', { movies: results });
        }
    });
});

// 管理评论页面
router.get('/manage-reviews', (req, res) => {
    if (req.session.user && req.session.user.role === 'admin') {
        db.query('SELECT * FROM Review', (err, results) => {
            if (err) {
                console.error('Error fetching reviews:', err);
                res.status(500).send('Error fetching reviews');
            } else {
                res.render('manage-reviews', { reviews: results });
            }
        });
    } else {
        res.status(403).send('Access denied');
    }
});

// 管理用户页面
router.get('/manage-users', (req, res) => {
    if (req.session.user && req.session.user.role === 'admin') {
        db.query('SELECT * FROM User', (err, results) => {
            if (err) {
                console.error('Error fetching users:', err);
                res.status(500).send('Error fetching users');
            } else {
                res.render('manage-users', { users: results });
            }
        });
    } else {
        res.status(403).send('Access denied');
    }
});

module.exports = router;
