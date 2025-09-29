import { WorkerStatus } from '@/types';
import mongoose, { Schema}from 'mongoose';

export interface WorkerDocument extends Document {
    id: string;
    name: string;
    status: WorkerStatus;
    currentJob?: string;
    processedJobs: number;
    lastHeartbeat: Date;
    memoryUsage: number;
    cpuUsage: number;
    createdAt: Date;
    updatedAt: Date;
}

const WorkerSchema = new Schema<WorkerDocument>({
    name: { type: String, required: true, unique: true },
    status: { 
        type: String, 
        enum: ['active', 'idle', 'failed'], 
        default: 'idle' 
    },
    currentJob: String,
    processedJobs: { type: Number, default: 0 },
    lastHeartbeat: { type: Date, default: Date.now },
    memoryUsage: Number,
    cpuUsage: Number
}, {
    timestamps: true,
    toJSON: {
        transform: function (_doc, ret) {
            ret.id = ret._id.toString()
            delete (ret as any).__v
            delete (ret as any)._id
            return ret
        }
    }
})

WorkerSchema.index({ status: 1 })
WorkerSchema.index({ createdAt: 1 })

export const WorkerModel = mongoose.model<WorkerDocument>('Worker', WorkerSchema)