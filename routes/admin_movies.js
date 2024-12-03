// routes/admin_movies.js
const express = require('express');
const router = express.Router();
const db = require('../db_config');
const { ensureAuthenticated } = require('../middleware/auth');

// 添加电影
router.post('/add', ensureAuthenticated, (req, res) => {
    if (req.session.user.role !== 'admin') {
        return res.status(403).send('Access Denied');
    }
    const { title, release_date, director, description, genre_id } = req.body;

    const query = `
        INSERT INTO Movie (title, release_date, director, description, genre_id)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(query, [title, release_date, director, description, genre_id], (err) => {
        if (err) {
            console.error('Error adding movie:', err);
            return res.status(500).send('Failed to add movie.');
        }
        res.redirect('/admin/movies');
    });
});

// 修改电影
router.post('/edit/:movie_id', ensureAuthenticated, (req, res) => {
    if (req.session.user.role !== 'admin') {
        return res.status(403).send('Access Denied');
    }
    const { title, release_date, director, description, genre_id } = req.body;
    const { movie_id } = req.params;

    const query = `
        UPDATE Movie
        SET title = ?, release_date = ?, director = ?, description = ?, genre_id = ?
        WHERE movie_id = ?
    `;
    db.query(query, [title, release_date, director, description, genre_id, movie_id], (err) => {
        if (err) {
            console.error('Error updating movie:', err);
            return res.status(500).send('Failed to update movie.');
        }
        res.redirect('/admin/movies');
    });
});

// 删除电影
router.post('/delete/:movie_id', ensureAuthenticated, (req, res) => {
    if (req.session.user.role !== 'admin') {
        return res.status(403).send('Access Denied');
    }
    const { movie_id } = req.params;

    const query = `
        DELETE FROM Movie WHERE movie_id = ?
    `;
    db.query(query, [movie_id], (err) => {
        if (err) {
            console.error('Error deleting movie:', err);
            return res.status(500).send('Failed to delete movie.');
        }
        res.redirect('/admin/movies');
    });
});

// 查询电影列表
router.get('/', ensureAuthenticated, (req, res) => {
    if (req.session.user.role !== 'admin') {
        return res.status(403).send('Access Denied');
    }
    const query = `
        SELECT m.movie_id, m.title, m.release_date, m.director, g.genre_name
        FROM Movie m
        LEFT JOIN Genre g ON m.genre_id = g.genre_id
        ORDER BY m.release_date DESC
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching movies:', err);
            return res.status(500).send('Failed to fetch movies.');
        }
        res.render('admin_movies', { movies: results });
    });
});

module.exports = router;
