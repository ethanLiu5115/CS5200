// routes/movies.js
const express = require('express');
const router = express.Router();
const db = require('../db_config');

// Browse Movies: 分页显示
router.get('/browse', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // 每页显示电影数量
    const offset = (page - 1) * limit;

    const query = `
        SELECT m.movie_id, m.title, m.release_date, m.director, m.description, g.genre_name
        FROM Movie m
        LEFT JOIN Genre g ON m.genre_id = g.genre_id
        ORDER BY m.release_date DESC
        LIMIT ? OFFSET ?
    `;
    const countQuery = `SELECT COUNT(*) AS total FROM Movie`;

    db.query(query, [limit, offset], (err, results) => {
        if (err) {
            console.error('Error fetching movies:', err);
            return res.status(500).send('Error fetching movies');
        }
        db.query(countQuery, (err, countResult) => {
            if (err) {
                console.error('Error fetching movie count:', err);
                return res.status(500).send('Error fetching movie count');
            }
            const totalMovies = countResult[0].total;
            const totalPages = Math.ceil(totalMovies / limit);
            res.render('browse', {
                movies: results,
                currentPage: page,
                totalPages,
            });
        });
    });
});

// Search Movies: 搜索并分页显示
router.get('/search', (req, res) => {
    const { title = '', genre = '' } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const query = `
        SELECT m.movie_id, m.title, m.release_date, m.director, m.description, g.genre_name
        FROM Movie m
        LEFT JOIN Genre g ON m.genre_id = g.genre_id
        WHERE m.title LIKE ? AND (g.genre_name LIKE ? OR ? = '')
        ORDER BY m.release_date DESC
        LIMIT ? OFFSET ?
    `;
    const countQuery = `
        SELECT COUNT(*) AS total
        FROM Movie m
        LEFT JOIN Genre g ON m.genre_id = g.genre_id
        WHERE m.title LIKE ? AND (g.genre_name LIKE ? OR ? = '')
    `;
    const params = [`%${title}%`, `%${genre}%`, genre, limit, offset];
    const countParams = [`%${title}%`, `%${genre}%`, genre];

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Error searching movies:', err);
            return res.status(500).send('Error searching movies');
        }
        db.query(countQuery, countParams, (err, countResult) => {
            if (err) {
                console.error('Error fetching search count:', err);
                return res.status(500).send('Error fetching search count');
            }
            const totalMovies = countResult[0].total;
            const totalPages = Math.ceil(totalMovies / limit);
            res.render('search', {
                movies: results,
                searchQuery: title,
                genreQuery: genre,
                currentPage: page,
                totalPages,
            });
        });
    });
});

// 显示电影详情页面
router.get('/details/:movie_id', (req, res) => {
    const movieId = req.params.movie_id;

    const movieQuery = `
        SELECT m.movie_id, m.title, m.release_date, m.director, m.description, g.genre_name
        FROM Movie m
        LEFT JOIN Genre g ON m.genre_id = g.genre_id
        WHERE m.movie_id = ?
    `;
    const reviewsQuery = `
        SELECT r.review_id, r.review_text, r.created_at, u.username, ra.rating_value
        FROM Review r
        LEFT JOIN Rating ra ON r.movie_id = ra.movie_id AND r.user_id = ra.user_id
        LEFT JOIN User u ON r.user_id = u.user_id
        WHERE r.movie_id = ?
    `;

    db.query(movieQuery, [movieId], (err, movieResults) => {
        if (err || movieResults.length === 0) {
            console.error('Error fetching movie details:', err);
            return res.status(404).send('Movie not found');
        }
        db.query(reviewsQuery, [movieId], (err, reviewsResults) => {
            if (err) {
                console.error('Error fetching reviews:', err);
                return res.status(500).send('Error fetching reviews');
            }
            res.render('details', {
                movie: movieResults[0],
                reviews: reviewsResults,
                session: req.session,
            });
        });
    });
});

module.exports = router;
