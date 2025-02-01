const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../configs/config');
const { transport, sender } = require('../../configs/mail');
const fs = require('fs');
const path = require('path');
const User = require('../../models/user');
const Role = require('../../models/role');

exports.signup = async (req, res) => {
    try {
        // Check if files are provided
        // if (!req.files || !req.files.profile_picture) {
        //     return res.status(400).json({ message: 'Profile picture is required' });
        // }

        // Define form validation rules schema
        const signupSchema = Joi.object({
            firstname: Joi.string().pattern(/^[a-zA-Z]+$/).min(3).max(30).required().label("First Name"),
            lastname: Joi.string().pattern(/^[a-zA-Z]+$/).min(1).max(30).required().label("Last Name"),
            email: Joi.string().email({ tlds: { allow: false } }).required().label("Email"),
            password: Joi.string()
                .min(6)
                .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{6,}$'))
                .required()
                .label("Password")
                .messages({
                    "string.pattern.base": "Password must have at least one uppercase letter, one lowercase letter, one number, and one special character.",
                }),
        });

        // Validate form data using Joi npm package
        const { error } = signupSchema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessages = error.details.reduce((acc, detail) => {
                acc[detail.context.key] = detail.message;
                return acc;
            }, {});
            return res.status(400).json({ message: 'Invalid inputs', errors: errorMessages });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email: req.body.email });
        if (userExists) {
            return res.status(401).json({ message: 'User already exists' });
        }

        // File validation
        const profilePicture = req.files.profile_picture;
        const allowedTypes = ['image/jpg', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(profilePicture.mimetype)) {
            return res.status(400).json({ message: 'Invalid file type. Only JPG, JPEG and PNG are allowed.' });
        }

        // Generate a unique file name using timestamp and original extension
        const fileExtension = path.extname(profilePicture.name);
        const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExtension}`;

        // Save file to a specific directory
        const uploadPath = path.join(__basedir, 'public/uploads/users', uniqueFileName);
        await profilePicture.mv(uploadPath, (err) => {
            if (err) {
                return res.status(500).json({ message: 'File upload failed', error: err });
            }
        });

        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 12);
        const roleData = await Role.findOne({ name: 'user' });

        if (!roleData) {
            return res.status(500).json({ message: 'Default user role not found' });
        }

        // Create a new user
        const newUser = new User({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: hashedPassword,
            role_id: roleData._id,
            profile_picture: uniqueFileName, // Store the unique file name
        });

        await newUser.save();

        let mailInfo = await transport.sendMail({
          from: sender,
          to: req.body.email,
          subject: "Signup Successful",
          html: "Congrats for signup with us.",
          category: "Integration Test",
          sandbox: true
        });

        res.status(201).json({ message: 'User registered successfully', user_id: newUser._id, mailInfo: mailInfo });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.login = async (req, res) => {

    // Validation schemas using Joi
    const loginSchema = Joi.object({
        email: Joi.string().email({ tlds: { allow: false } }).required().label("Email"),
        password: Joi.string()
        .min(6)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{6,}$'))
        .required()
        .label("Password")
        .messages({
            "string.pattern.base":
                "Password must have at least one uppercase letter, one lowercase letter, one number, and one special character.",
        }),
    });

    // Validate the request body against the schema
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false, errors: { label: 'key' } });

    // If validation fails, return an error response
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    //const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: req.body.email })
        .select('_id firstname lastname email password role_id')
        .populate('role_id');

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare passwords
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const payload = { user_id: user._id, email: user.email, role_id: user.role_id };
        const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '4h' });
        user.password = undefined;

        res.status(200).json({ message: 'Login successful', user: user, token: token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};