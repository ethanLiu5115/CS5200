// routes/admin_reviews.js
const express = require('express');
const router = express.Router();
const db = require('../db_config');
const { ensureAuthenticated } = require('../middleware/auth');

// 查询评论
router.get('/', ensureAuthenticated, (req, res) => {
    if (req.session.user.role !== 'admin') {
        return res.status(403).send('Access Denied');
    }
    const query = `
        SELECT r.review_id, u.username, m.title AS movie_title, r.review_text, r.rating, rs.status_name
        FROM Review r
        JOIN User u ON r.user_id = u.user_id
        JOIN Movie m ON r.movie_id = m.movie_id
        JOIN Review_Status rs ON r.status_id = rs.status_id
        ORDER BY r.created_at DESC
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching reviews:', err);
            return res.status(500).send('Failed to fetch reviews.');
        }
        res.render('admin_reviews', { reviews: results });
    });
});

// 删除评论
router.post('/delete/:review_id', ensureAuthenticated, (req, res) => {
    if (req.session.user.role !== 'admin') {
        return res.status(403).send('Access Denied');
    }
    const { review_id } = req.params;

    const query = `
        DELETE FROM Review WHERE review_id = ?
    `;
    db.query(query, [review_id], (err) => {
        if (err) {
            console.error('Error deleting review:', err);
            return res.status(500).send('Failed to delete review.');
        }
        res.redirect('/admin/reviews');
    });
});

module.exports = router;
