import { tryCatch } from "bullmq";
import { NextFunction, Request, Response } from "express";
import { workerservice } from "../services/workerService";



export class WorkerController {
    async listWorkers(req: Request, res: Response, next: NextFunction){
        try{
            const workers = await workerservice.listWorkers()
            res.json(workers)
        }catch(error) {
            res.status(500).json({
                error: error instanceof Error ? error.message: 'Unknown error'
            })
            return next(error)
        }
    }

    async registerWorker(req: Request, res: Response, next: NextFunction) {
        try {
            const {name} = req.body
            const worker = await workerservice.registerWorker(name)
            res.json(worker)
        } catch (error) {
            res.status(400).json({
                error: error instanceof Error ? error.message: 'Unknown error'
            })
            return next(error)
        }
    }

    async updateWorkerStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params
            const { status, memoryUsage, cpuUsage, currentJob } = req.body
            const worker = await workerservice.updateWorkerstatus(id, status, {
                memoryUsage,
                cpuUsage,
                currentJob
            })

            res.json(worker)
        } catch (error) {
            res.status(400).json({
                error: error instanceof Error ? error.message: 'Unknown error'
            })
            return next(error)
        }
    }
}


export const workerController = new WorkerController()