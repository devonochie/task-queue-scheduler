import { JobModel } from "../models/Job"
import { queueManager } from "../queues/queue"
import { CreateJobRequest, Job, JobFilter } from "../types"



export class JobService {
    async createJob(jobData: CreateJobRequest): Promise<Job> {
        const { type, payload, scheduleTime , retryPolicy } = jobData

        const job = new JobModel({
            type,
            payload,
            scheduledTime: scheduleTime ? new Date(scheduleTime): new Date(),
            maxRetries: retryPolicy?.maxAttempts || 3
        })

        const savedJob = await job.save()

        //Add to queue with optional delay
        const delay = scheduleTime ? new Date(scheduleTime).getTime() - Date.now() : 0

        await queueManager.addJob('default', type, payload, {
            jobId: savedJob.id,
            delay: delay > 0 ? delay : undefined
        })

        return savedJob.toJSON() as Job
    }

    async getJob (id: string): Promise<Job | null> {
        const job = await JobModel.findById(id)
        return job ? job.toJSON() as Job : null
    }

    async listJobs(filter: JobFilter = {}): Promise<{jobs: Job[]; total: number }> {
        const { type, status, startDate, endDate, page = 1, limit = 10 } = filter
        const query: any = {}

        if(type) query.type = type
        if(status) query.status = status

        if(startDate || endDate ) {
            query.createdAt = {}
            if(startDate) query.createdAt.$gte = new Date(startDate)
            if(endDate) query.createdAt.$gte = new Date(endDate)
        }

        const skip = (page - 1) * limit

        const [jobs, total] = await Promise.all([
            JobModel.find(query)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip),
            JobModel.countDocuments(query)
        ])

        return {
            jobs: jobs.map(job => job.toJSON() as Job ),
            total
        }
    }

    async retryJob(id: string): Promise<Job | null> {
        const job = await JobModel.findById(id)

        if(!job || job.status !== 'failed') {
            throw new Error('Job not found or not in failed state')
        }

        if(job.retryCount >= job.maxRetries ) {
            throw new Error("Maximum retry attempts exceeded")
        }

        job.retryCount += 1
        job.status = 'pending'
        job.startedAt = undefined
        job.completedAt = undefined
        job.error = undefined

        const updatedJob = await job.save()

        await queueManager.addJob('default', job.type, job.payload, {
            jobId: job.id
        })

        return updatedJob.toJSON() as Job
    }

    async cancelJob(id: string): Promise<Job | null> {
        const job = await JobModel.findById(id)

        if(!job || !["pending", "running"].includes(job.status)) {
            throw new Error("Job not found or not cancellable")
        }

        job.status = "failed"
        job.error = "Cancelled by user"
        job.completedAt = new Date()

        const updatedJob = job.save()

        try {
            const queue = await queueManager.qetQueue('default')
            const bullJob = await queue.getJob(id)
            if(bullJob) {
                await bullJob.remove()
            }
        } catch (error) {
            console.error('Error removing job from queue:', error);
        }

        return (await updatedJob).toJSON() as Job
    }

    async getJobStats(): Promise<any> {
        const stats = await JobModel.aggregate([
            {
                $group: {
                _id: '$status',
                count: { $sum: 1 }
                }
            }
        ])

        const result = {
            total: 0,
            pending: 0,
            running: 0,
            completed: 0,
            failed: 0
        }

        stats.forEach(stat => {
            const key = stat._id as keyof typeof result
            result[key] = stat.count
            result.total += stat.count
        })

        return result;
    }

    async addJobLog(jobid: string, message: string, level: 'info' | "warn" | "error" = "info") {
        await JobModel.findByIdAndUpdate(jobid, {
            $push: {
                logs: {
                    timestamp: new Date(),
                    message,
                    level
                }
            }
        })
    }
}


export const jobService = new JobService()