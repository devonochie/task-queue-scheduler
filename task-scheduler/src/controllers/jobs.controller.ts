import { JobModel } from "@/models/Job";
import { jobService } from "@/services/jobService";
import { CreateJobRequest, JobFilter } from "@/types";
import { NextFunction, Request, Response } from "express";


export class JobController {
    async createJob(req: Request, res: Response, next: NextFunction) {
        try {
            const jobData: CreateJobRequest = req.body
            const job = await jobService.createJob(jobData)
            res.status(201).json(job)
        } catch (error) {
            res.status(400).json({
                error: error instanceof Error ? error.message: 'Unknown error'
            })
            return next(error)
        }
    }

    async getJob(req: Request, res: Response, next: NextFunction) {
        try {
            const  { id } = req.params
            const job = await jobService.getJob(id)

            if(!job) {
                return res.status(404).json({
                    error: 'Job not found'
                })
            }

            res.json(job)
        } catch (error) {
            res.status(400).json({
                error: error instanceof Error ? error.message: 'Unknown error'
            })
            return next(error)
        }
    }

    async listJobs(req: Request, res: Response, next: NextFunction) {
        try {
            const  filter : JobFilter =  {
                type: req.query.type as string,
                status: req.query.status as any,
                startDate: req.query.startDate as string,
                endDate: req.query.endDate as string,
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 10
            }

            const result = await jobService.listJobs(filter)
            res.json(result)
        } catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message: 'Unknown error'
            })
            return next(error)
        }
    }

    async retryJob(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params
            const job = await jobService.retryJob(id)
            res.json(job)
        } catch (error) {
            res.status(400).json({
                error: error instanceof Error ? error.message: 'Unknown error'
            })
            return next(error)
        }
    }

    async cancelJob(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params
            const job = await jobService.cancelJob(id)
            res.json(job)
        } catch (error) {
            res.status(400).json({
                error: error instanceof Error ? error.message: 'Unknown error'
            })
            return next(error)
        }
    }

    async getJobStats( _req: Request, res: Response, next: NextFunction) {
        try {
            const stats = await jobService.getJobStats()
            res.json(stats)
        } catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message: 'Unknown error'
            })
            return next(error)
        }
    }

    async deleteJob(req: Request, res: Response, next: NextFunction) {
        try {
            const job = await JobModel.findByIdAndDelete(req.params.id)
            res.json(job)
        } catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message: 'Unknown error'
            })
            return next(error)
        }
    }
}

export const jobController = new JobController()