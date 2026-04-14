import { Router } from 'express';
import { VideoController } from '../controllers/VideoController';
import { authenticate } from '../middleware/authenticate';

const router = Router();
const videoController = new VideoController();

// Routes
router.get('/', videoController.getVideos);
router.get('/:id/stream', videoController.streamVideo);
router.get('/:id', videoController.getVideo);
router.post('/:id/progress', authenticate, videoController.updateProgress);
router.get('/:id/quiz', videoController.getQuiz);
router.post('/:id/quiz/submit', authenticate, videoController.submitQuiz);

export { router as videoRoutes };