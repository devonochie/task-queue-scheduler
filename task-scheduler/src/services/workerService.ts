import { WorkerModel } from "../models/Worker";
import { Worker, WorkerStatus } from "../types";


export class WorkerService {
    async registerWorker(name: string): Promise<Worker> {
        let worker = await WorkerModel.findOne({name})

        if(!worker) {
            worker = new WorkerModel({name})
        }

        worker.status = "idle"
        worker.lastHeartbeat = new Date()

        const savedWorker = await worker.save()
        return savedWorker.toJSON() as Worker
    }

    async updateWorkerstatus( 
        workerId: string,
        status: WorkerStatus,
        metrics: {memoryUsage: number; cpuUsage: number; currentJob?: string}
    ): Promise<Worker> {
        const worker = await WorkerModel.findByIdAndUpdate(
            workerId,{
                status,
                lastHeartbeat: new Date(),
                ...metrics,
                $inc: status === 'idle' && metrics.currentJob ? { processedJobs: 1 } : {}
            },
            { new : true }
        )

        if(!worker) {
            throw new Error("Worker not found")
        }

        return worker.toJSON() as Worker
    }

    async listWorkers(): Promise<Worker[]> {
        const workers = await WorkerModel.find().sort({ lastHeartbeat: -1 });
        return workers.map(worker => worker.toJSON() as Worker);
    }

    async cleanupStaleWorkers(timeoutMs: number = 30000): Promise<void> {
        const cutoffTime = new Date(Date.now() - timeoutMs);
        
        await WorkerModel.updateMany(
        { lastHeartbeat: { $lt: cutoffTime } },
        { status: 'failed' }
        );
    }
}

export const workerservice = new WorkerService()