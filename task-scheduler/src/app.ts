import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import { queueManager } from './queues/queue'
import { jobProcessors } from './queues/processors'
import mongoose from 'mongoose'
import { workerservice } from './services/workerService'
import workerRoutes from './routes/workers'
import jobRoutes from './routes/jobs'


class Application {
    private app: express.Application

    constructor() {
        this.app = express()
        this.setupMiddleware()
        this.setupRoutes()
        this.setupQueue()
    }

    private setupMiddleware() {
        this.app.use(cors({
            origin: "http://localhost:8080",
            credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization"]
        }))
        this.app.use(express.json())
    }

    private setupRoutes() {
        this.app.use('/api/jobs', jobRoutes)
        this.app.use('/api/workers', workerRoutes)

        this.app.get('/health', (_req, res) => {
        res.json({ status: 'OK', timestamp: new Date().toISOString() });
        });
    }

    private setupQueue(){
        queueManager.createWorker('default', async (job) => {
            const processorMap = {
                "email-send": jobProcessors.processEmail,
                "report-generate": jobProcessors.processReport,
                "data-sync": jobProcessors.processDataSync
            };
            const processor = processorMap[job.name as keyof typeof processorMap]

            if(!processor) {
                throw new Error(`No processor found for job type: ${job.name}`)
            }

            return await processor(job)
        }, { concurrency: 5 })
    }

    async connectDatabase() {
        mongoose.set('strictQuery', false)
        await mongoose.connect(process.env.MONGO_URI as string)
            .then(() => console.log('Connected to MongoDB'))
            .catch((error) => console.log('Database connection error', error))
    }

    async start(){
        const PORT = process.env.PORT || 3000
        await this.connectDatabase()

        setInterval (() => {
            workerservice.cleanupStaleWorkers()
        }, 5 * 60 * 1000)

        this.app.listen(PORT, () => {
            console.log((`Task Queue Server running on port ${PORT}`))
        })
    }

    async gracefulShutDown(){
        console.log('Shutting dowm gracefully...')
        await queueManager.close()
        await mongoose.connection.close()
        // await closeRedis()
        process.exit(0)
    }
}

export const app = new Application