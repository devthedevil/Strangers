const express = require('express');
const router = express.Router();

const usersController = require('../controllers/users_controller');

router.get('/profile',usersController.profile);
// router.get('/',usersController.users);
router.get('/post',usersController.post);
module.exports = router;