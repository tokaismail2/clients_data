const express = require('express'); 
const { data } = require('./userController');


const router = express.Router();
router.post('/register', data);


module.exports = router;