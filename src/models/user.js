const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        firstname: {
            type: String,
            required: [true, 'Firstname must be provided!'],
            trim: true,
        },
        lastname: {
            type: String,
            required: [true, 'Lastname must be provided!'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required!'],
            trim: true,
            unique: [true, 'Email must be unique!'],
            minLength: [5, 'Email must have 5 characters!'],
            lowercase: true,
        },
        password: {
            type: String,
            required: [true, 'Password must be provided!'],
            trim: true,
            select: false,
        },
        role_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
            required: true,
        },
        profile_picture: {
            type: String,
            trim: true,
            default: null, // Default to null if no file is uploaded
        },
        verified: {
            type: Boolean,
            default: false,
        },
        is_active: {
            type: Boolean,
            default: true,
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema)