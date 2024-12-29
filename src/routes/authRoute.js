import express from 'express';
// import {authenticate} from '../middlewares/authMiddleware.js'
import {login,register,getUser,getUserById,registerMultipleUsers} from '../controllers/authController.js';
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

export default router;