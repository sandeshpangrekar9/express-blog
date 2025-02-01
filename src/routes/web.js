const express = require('express');
const router = express.Router();
const path = require('path');

const homeController  = require("../controllers/homeController.js");

// Serve the static HTML file
//router.get('/', (req, res) => {
    //res.sendFile(path.join(__dirname, '../public/index.html'));
    //res.render('pages/home');
//});

router.get("/", homeController.index);

module.exports = router;