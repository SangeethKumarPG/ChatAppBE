const express = require('express');

const router = express.Router();
const jwtMiddleWare = require('../middlewares/jwtMiddleWare');

const userController = require('../controller/userController');

router.post('/register',userController.registerUser);
router.post('/login',userController.loginUser);
router.post('/logout',jwtMiddleWare, userController.logoutUser );

module.exports = router;