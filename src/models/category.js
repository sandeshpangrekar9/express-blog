const mongoose = require('mongoose');

const categorySchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Category name must be provided!'],
            unique: true,
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

module.exports = mongoose.model("Category", categorySchema)