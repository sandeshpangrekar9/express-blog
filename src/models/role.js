const mongoose = require('mongoose');

const roleSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Role name must be provided!'],
            unique: true,
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Role", roleSchema)