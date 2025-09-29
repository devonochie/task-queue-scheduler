import { workerController } from '@/controllers/workers.controller';
import { Router } from 'express';

const router = Router();

router.get('/', workerController.listWorkers);
router.post('/register', workerController.registerWorker);
router.put('/:id/status', workerController.updateWorkerStatus);

export default router;