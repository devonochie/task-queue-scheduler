// src/types/index.ts
export type JobStatus = "pending" | "running" | "completed" | "failed";
export type WorkerStatus = "active" | "idle" | "failed";

export interface JobPayload {
    type: string;
    payload: Record<string, any>;
    scheduleTime?: Date;
    retryPolicy?: {
        maxAttempts: number;
        delay: number; 
    };
    }

export interface Job {
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

export interface JobLog {
    timestamp: Date;
    message: string;
    level: "info" | "warn" | "error";
}

export interface Worker {
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

export interface JobStats {
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
}

export interface CreateJobRequest {
    type: string;
    payload: Record<string, any>;
    scheduleTime?: string;
    retryPolicy?: {
        maxAttempts: number;
        delay: number;
    };
}

export interface JobFilter {
    type?: string;
    status?: JobStatus;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}