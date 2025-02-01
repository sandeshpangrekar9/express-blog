const config = require('../../configs/config');
const User = require('../../models/user');
const Category = require('../../models/category');
const Post = require('../../models/post');
const Joi = require('joi');

exports.createPost = async (req, res) => {
    const { title, description, category_id } = req.body;
    const user_id = req.user.user_id;

    const createPostSchema = Joi.object({
        title: Joi.string().min(3).max(60).required(),
        description: Joi.string().min(3).max(600).required(),
        category_id: Joi.string().required()
    });

    try {
        const { error, value } = createPostSchema.validate({
            title,
            description,
            category_id
        });
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message });
        }

        const result = await Post.create({
            title,
            description,
            category_id,
            user_id,
        });
        res.status(201).json({ success: true, message: 'created', data: result });
    } catch (error) {
        console.log(error);
    }
};

exports.updatePost = async (req, res) => {
    const { _id } = req.query;
    const { title, description, category_id } = req.body;
    const user_id = req.user.user_id;

    const updatePostSchema = Joi.object({
        title: Joi.string().min(3).max(60).required(),
        description: Joi.string().min(3).max(600).required(),
        category_id: Joi.string().required()
    });

    try {
        const { error, value } = updatePostSchema.validate({
            title,
            description,
            category_id
        });
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message });
        }
        const existingPost = await Post.findOne({ _id });
        if (!existingPost) {
            return res.status(404).json({ success: false, message: 'Post unavailable' });
        }
        if (existingPost.user_id.toString() !== user_id) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        existingPost.title = title;
        existingPost.description = description;
        existingPost.category_id = category_id;

        const result = await existingPost.save();
        res.status(200).json({ success: true, message: 'Updated', data: result });
    } catch (error) {
        console.log(error);
    }
};

exports.deletePost = async (req, res) => {
    const { _id } = req.query;
    const user_id = req.user.user_id;

    try {
        const existingPost = await Post.findOne({ _id });
        if (!existingPost) {
            return res.status(404).json({ success: false, message: 'Post already unavailable' });
        }
        if (existingPost.user_id.toString() !== user_id) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        await Post.deleteOne({ _id });
        res.status(200).json({ success: true, message: 'deleted' });
    } catch (error) {
        console.log(error);
    }
};

exports.getAllPosts = async (req, res) => {
    const postsPerPage = 10;
    const page = parseInt(req.query.page, 10) || 1;
    const skip = (page - 1) * postsPerPage;

    try {
        // Get total count of posts
        const totalRecords = await Post.countDocuments({ is_active: true });

        const posts = await Post.find({ is_active: true })
            .select('title description createdAt updatedAt category_id user_id is_active')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(postsPerPage)
            .populate({
                path: 'user_id',
                select: 'firstname lastname email role_id profile_picture verified is_active createdAt updatedAt',
                populate: { path: 'role_id', select: 'name' },
            })
            .populate({
                path: 'category_id',
                select: 'name description is_active createdAt updatedAt',
            });

        const totalPages = Math.ceil(totalRecords / postsPerPage);
        const nextPage = page < totalPages ? page + 1 : null;
        const previousPage = page > 1 ? page - 1 : null;
        const hasNextPage = nextPage !== null;
        const hasPreviousPage = previousPage !== null;

        return res.status(200).json({
            success: true,
            message: 'Posts retrieved successfully',
            data: posts,
            pagination: {
                totalRecords,
                currentPage: page,
                totalPages,
                recordsOnCurrentPage: posts.length,
                nextPage,
                previousPage,
                hasNextPage,
                hasPreviousPage,
            },
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};

exports.getSinglePost = async (req, res) => {
    const { _id } = req.query;

    try {
        const existingPost = await Post.findOne({ _id })
        .select('title description createdAt updatedAt category_id user_id is_active')
        .populate({
            path: 'user_id',
            select: 'firstname lastname email role_id profile_picture verified is_active createdAt updatedAt',
            populate: { path: 'role_id', select: 'name' },
        })
        .populate({
            path: 'category_id',
            select: 'name description is_active createdAt updatedAt',
        });

        if (!existingPost) {
            return res.status(404).json({ success: false, message: 'Post unavailable' });
        }
        res.status(200).json({ success: true, message: 'single post', data: existingPost });
    } catch (error) {
        console.log(error);
    }
};