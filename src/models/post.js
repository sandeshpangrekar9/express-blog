const mongoose = require('mongoose');

const postSchema = mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, 'title is required!'],
			trim: true,
		},
		description: {
			type: String,
			required: [true, 'description is required!'],
			trim: true,
		},
		category_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Category",
			required: true,
		},
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
            ref: 'User',
		},
		is_active: {
            type: Boolean,
            default: true,
        }
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);