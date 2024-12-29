import express from 'express';
import {authenticate} from '../middlewares/authMiddleware.js'
import {login,register,getUser,getUserById} from '../controllers/authController.js';
const router = express.Router();

// route for creater of app 
// get all user 
router.get('/',getUser)
// register a user
router.post('/register',register);
 
// login a user and authenticate the token
router.post('/login', login);

// get user by id
router.get('/:id',authenticate,getUserById);

export default router;