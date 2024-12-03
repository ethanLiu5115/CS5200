// app.js
const express = require('express');
const session = require('express-session');
const app = express();
const db = require('./db_config');
const bcrypt = require('bcrypt');

// 导入路由
const moviesRouter = require('./routes/movies');
const homeRouter = require('./routes/home');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const adminMoviesRouter = require('./routes/admin_movies');
const adminUsersRouter = require('./routes/admin_users');
const adminReviewsRouter = require('./routes/admin_reviews');
const { ensureAuthenticated, ensureGuest } = require('./middleware/auth');

const PORT = process.env.PORT || 3000;

// 设置模板引擎和中间件
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 设置 Session
app.use(
    session({
        secret: 'your_secret_key',
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 3600000 }, // 设置 Cookie 有效期为 1 小时
    })
);

// 设置全局 session 变量
app.use((req, res, next) => {
    res.locals.session = req.session || {};
    next();
});

// 路由配置
app.use('/auth', authRouter);
app.use('/profile', ensureAuthenticated, profileRouter);
app.use('/movies', ensureAuthenticated, moviesRouter);
app.use('/admin/movies', ensureAuthenticated, adminMoviesRouter);
app.use('/admin/users', ensureAuthenticated, adminUsersRouter);
app.use('/admin/reviews', ensureAuthenticated, adminReviewsRouter);
app.use('/', ensureAuthenticated, homeRouter);

// 捕获 404 错误
app.use((req, res) => {
    res.status(404).render('error', { message: 'Page Not Found' });
});

// 全局错误处理
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).render('error', { message: 'An unexpected error occurred.' });
});

// 启动服务
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
