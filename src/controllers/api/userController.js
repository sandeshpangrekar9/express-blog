const config = require('../../configs/config');
const User = require('../../models/user');
const Joi = require('joi');


exports.profile = async (req, res) => {

    try {
        const user = await User.findOne({ _id: req.user.user_id })
        .select('_id firstname lastname email role_id profile_picture verified is_active')
        .populate('role_id');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User profile fetched', user: user });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};