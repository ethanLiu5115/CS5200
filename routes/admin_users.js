// routes/admin_users.js
const express = require('express');
const router = express.Router();
const db = require('../db_config');
const { ensureAuthenticated } = require('../middleware/auth');

// 查询用户列表
router.get('/', ensureAuthenticated, (req, res) => {
    if (req.session.user.role !== 'admin') {
        return res.status(403).send('Access Denied');
    }
    const query = `
        SELECT user_id, username, email, role, created_at
        FROM User
        ORDER BY created_at DESC
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).send('Failed to fetch users.');
        }
        res.render('admin_users', { users: results });
    });
});

// 修改用户角色
router.post('/edit-role/:user_id', ensureAuthenticated, (req, res) => {
    if (req.session.user.role !== 'admin') {
        return res.status(403).send('Access Denied');
    }
    const { role } = req.body;
    const { user_id } = req.params;

    const query = `
        UPDATE User
        SET role = ?
        WHERE user_id = ?
    `;
    db.query(query, [role, user_id], (err) => {
        if (err) {
            console.error('Error updating user role:', err);
            return res.status(500).send('Failed to update user role.');
        }
        res.redirect('/admin/users');
    });
});

// 删除用户
router.post('/delete/:user_id', ensureAuthenticated, (req, res) => {
    if (req.session.user.role !== 'admin') {
        return res.status(403).send('Access Denied');
    }
    const { user_id } = req.params;

    const query = `
        DELETE FROM User WHERE user_id = ?
    `;
    db.query(query, [user_id], (err) => {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).send('Failed to delete user.');
        }
        res.redirect('/admin/users');
    });
});

module.exports = router;
