const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { validateRegisterInput } = require('../middleware/validationMiddleware');

router.post('/register', validateRegisterInput, registerUser);
router.post('/login', loginUser);

module.exports = router;
