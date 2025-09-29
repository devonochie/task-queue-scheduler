import { JobModel } from '@/models/Job'
import { RedisClient } from '@/services/redisService'
import { Queue, Job as BullJob, Worker } from 'bullmq'


class QueueManager {
    private connection = RedisClient.getInstance()
    private queues: Map<string, Queue> = new Map()
    private workers: Map<string, Worker> = new Map()
    
    constructor () {
        this.connection = RedisClient.getInstance()
    }

    async createQueue(name: string){
        const queue = new Queue(name, {
            connection: this.connection,
            defaultJobOptions: {
                removeOnComplete: 100,
                removeOnFail: 100,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000
                }
            }
        })

        this.queues.set(name, queue)

        return queue
    }

    async qetQueue(name: string): Promise<Queue> {
        if (!this.queues.has(name)) {
            return this.createQueue(name)
        }
        return this.queues.get(name)!
    }

    async addJob(
        queueName: string,
        jobType: string,
        payload: any,
        options: { delay?: number; jobId?: string} = {}
    ) {
        const queue = await this.qetQueue(queueName)

        const job = await queue.add(jobType, payload, {
            jobId: options.jobId,
            delay: options.delay
        })

        return job
    }

    async createWorker( 
        queueName: string, 
        processoer: (job: BullJob) => Promise<any>,
        options: {concurrency?: number } = {}
    ){
        const worker = new Worker(
            queueName,
            async (job: BullJob) => {
                try {
                    await JobModel.findByIdAndUpdate(job.id, {
                        status: 'running',
                        startedAt: new Date(),
                        assignedWorker: `${queueName}-worker`
                    })

                    const result = await processoer(job)

                    await JobModel.findByIdAndUpdate(job.id, {
                        status: 'completed',
                        completedAt: new Date()
                    })

                    return result
                } catch (error) {
                    await JobModel.findByIdAndUpdate(job.id, {
                        status: 'failed',
                        error: error instanceof Error ? error.message : 'Unknown error',
                        completedAt: new Date()
                    });
                    throw error;
                }
            },
            {
                connection: this.connection,
                concurrency: options.concurrency || 1
            }
        )
        this.workers.set(`${queueName}-worker`, worker);
        return worker;
    }

    async close() {
        for (const worker of this.workers.values()) {
            await worker.close()
        }
        for (const queue of this.queues.values()) {
            await queue.close()
        }
        await this.connection.quit()
    }
}

export const queueManager = new QueueManager()