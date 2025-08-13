import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate } from '../middleware/authenticate';

const router = Router();
const userController = new UserController();

// All user routes require authentication
router.use(authenticate);

// Routes
router.get('/progress', userController.getUserProgress);
router.get('/achievements', userController.getUserAchievements);
router.put('/profile', userController.updateProfile);
router.get('/stats', userController.getUserStats);

export { router as userRoutes };