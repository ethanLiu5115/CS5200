// middleware/auth.js

// 确保用户已登录
function ensureAuthenticated(req, res, next) {
    console.log('Checking authentication...');
    console.log('Session:', req.session);

    if (req.session && req.session.user) {
        return next();
    }

    console.log('User not authenticated. Redirecting to /auth/login');
    res.redirect('/auth/login');
}

// 确保用户未登录
function ensureGuest(req, res, next) {
    console.log('Checking guest access...');
    console.log('Session:', req.session);

    if (!req.session || !req.session.user) {
        return next();
    }

    console.log('User already authenticated. Redirecting to /');
    res.redirect('/');
}

module.exports = { ensureAuthenticated, ensureGuest };
