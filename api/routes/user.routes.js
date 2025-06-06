import express from 'express';
import * as userController from '../controllers/user.controllers.js';

const router = express.Router();

// Define routes
router.post('/', userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
