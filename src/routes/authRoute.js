import express from 'express';
// import {authenticate} from '../middlewares/authMiddleware.js'     ///later more impoveement
import {login,register,getUser,getUserById,registerMultipleUsers,updateUserProfile} from '../controllers/authController.js';
const router = express.Router();

// get all user 
router.get('/',getUser); // tested

// get user by id
router.get('/:id',getUserById); // tested

// register a user
router.post('/register',register); // tsted
 
// login a user and authenticate the token
router.post('/login', login); // tested

// register multiple user accounts 
router.post('/multipleregister',registerMultipleUsers) // tested

// update user profile

router.patch('/:id', updateUserProfile); // tested

export default router;