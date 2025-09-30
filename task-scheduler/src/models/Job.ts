import mongoose , { Schema, Document } from 'mongoose'
import { JobLog, JobStatus } from '../types';

export interface JobDocument extends Document {
    id: string;
    type: string;
    status: JobStatus;
    payload: Record<string, any>;
    scheduledTime: Date;
    startedAt?: Date;
    completedAt?: Date;
    retryCount: number;
    maxRetries: number;
    assignedWorker?: string;
    logs: JobLog[];
    error?: string;
    createdAt: Date;
    updatedAt: Date;
}

const JobLogSchema = new Schema({
    timestamp: { type: Date, default: Date.now },
    message: { type: String, required: true },
    level: { type: String, enum: ["info", "warn", "error"], default: "info"}
})

const JobSchema = new Schema<JobDocument>({
    type: { type: String, required: true },
    status: {
        type: String,
        enum: ["pending", "running", "completed", "failed"],
        default: "pending"
    },
    payload: { type: Schema.Types.Mixed, default: {} },
    scheduledTime: { type: Date, default: Date.now },
    startedAt: Date,
    completedAt: Date,
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },
    assignedWorker: String,
    logs: [JobLogSchema],
    error: String
}, {
    timestamps: true,
    toJSON: {
        transform: function(_doc, ret) {
            ret.id = (ret._id as mongoose.Types.ObjectId).toString()
            delete ret._id,
            delete (ret as any).__v
            return ret
        } 
    }
})

JobSchema.index({ status: 1})
JobSchema.index({ type: 1 })
JobSchema.index({ scheduledTime: 1 })
JobSchema.index({ createdat: 1 })

export const JobModel = mongoose.model<JobDocument>("Job", JobSchema )