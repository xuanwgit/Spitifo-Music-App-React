import express from 'express';
import { signupUser, loginUser, updateUser, deleteUser } from '../controllers/userController.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

// login route
router.post('/login', loginUser);

// signup route
router.post('/signup', signupUser);

// protected routes
router.patch('/:id', requireAuth, updateUser);
router.delete('/:id', requireAuth, deleteUser);

export default router;
