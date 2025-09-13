const express = require ('express');
const router = express.Router();

const User = require('../models/user.js');

//application index page
router.get('/', (req, res) => {
    try {
        res.render('applications/index.ejs');
    } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

//app create form page
// controllers/applications.js

router.get('/new', async (req, res) => {
  res.render('applications/new.ejs');
});


module.exports = router;