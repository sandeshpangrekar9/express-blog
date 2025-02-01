const User = require('../models/user');

exports.index = async (req, res) => {
    try {
        res.render('pages/home', { title: 'Home Page', message: 'Welcome to the Home Page.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};