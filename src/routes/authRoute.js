import express from 'express';
import {login,register,getUser,getUserById} from '../controllers/authController.js';
const router = express.Router();

// register a user
router.post('/register', (req, res) => {
    console.log('Register route hit');
    register(req, res);
});
 
// login a user and authenticate the token
router.post('/login', login);

// get all user 
router.get('/',getUser)

// get user by email
router.get('/:id', getUserById);

export default router;