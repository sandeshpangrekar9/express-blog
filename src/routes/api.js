const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');

const verifyTokenMiddleware = require('../middlewares/verifyTokenMiddleware');

const authController = require('../controllers/api/authController');
const userController = require('../controllers/api/userController');
const postController = require('../controllers/api/postController');


const fileUploadMiddleware = fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // limit file size to 10MB
    createParentPath: true, // automatically create missing directories
    safeFileNames: true, // sanitize file names
    preserveExtension: true, // preserve file extension
    abortOnLimit: true, // automatically abort the request if the file exceeds the size limit
    debug: false, // enable debug mode to log file upload details
    parseNested: true, // parse nested objects (e.g., req.body.nested.key)
    enforceFileType: true, // enforce file type restriction (optional)
    fileFilter: (file) => {
        const allowedMimeTypes = ['image/jpg', 'image/jpeg', 'image/png'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return false; // reject the file
        }
        return true; // accept the file
    },
    responseOnLimit: "File size limit exceeded", // custom response when the file size limit is exceeded
})

router.post('/auth/signup', fileUploadMiddleware, authController.signup);
router.post('/auth/login', authController.login);

router.use('/user', verifyTokenMiddleware); // Apply middleware to all /user/* routes
router.get('/user/profile', userController.profile);

router.use('/post', verifyTokenMiddleware); // Apply middleware to all /post/* routes
router.get('/post/all-posts', postController.getAllPosts);
router.get('/post/single-post', postController.getSinglePost);
router.post('/post/create-post', postController.createPost);
router.put('/post/update-post', postController.updatePost);
router.delete('/post/delete-post', postController.deletePost);

module.exports = router;