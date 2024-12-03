// routes/profile.js
const express = require('express');
const router = express.Router();
const db = require('../db_config');

// 个人资料页面
router.get('/', (req, res) => {
    const userId = req.session.user.id;

    const query = `
        SELECT username, email, role, created_at
        FROM User
        WHERE user_id = ?
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user profile:', err);
            res.status(500).send('Error fetching user profile');
        } else if (results.length === 0) {
            res.status(404).send('User not found');
        } else {
            res.render('profile', { user: results[0] });
        }
    });
});

module.exports = router;
