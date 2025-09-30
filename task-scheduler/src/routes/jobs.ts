import { Router } from "express";
import { jobController } from "../controllers/jobs.controller";


const router = Router()

router.post('/', jobController.createJob);
router.get('/', jobController.listJobs);
router.get('/stats', jobController.getJobStats);
router.get('/:id', jobController.getJob);
router.post('/:id/retry', jobController.retryJob);
router.delete('/:id', jobController.cancelJob);
router.delete('/:id/delete', jobController.deleteJob);

export default router