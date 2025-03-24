import express from 'express';
import { loginAdmin, signupAdmin } from '../controllers/adminController.js';
import { updateUser, deleteUser, getUser, getUsers, createAdmin } from '../controllers/userController.js';
import requireAuth from '../middleware/requireAuth.js';
import requireAdmin from '../middleware/requireAdmin.js';

const router = express.Router();

// login route
router.post('/login', loginAdmin);

// signup route
router.post('/signup', requireAuth, signupAdmin);

// Apply admin middleware to all routes below this
router.use(requireAdmin);

// Admin routes
router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', createAdmin);
router.delete('/:id', deleteUser);
router.patch('/:id', updateUser);

export default router;
