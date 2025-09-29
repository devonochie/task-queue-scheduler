/* eslint-disable @typescript-eslint/no-explicit-any */
export type JobStatus = "pending" | "running" | "completed" | "failed";
export type WorkerStatus = "active" | "idle" | "failed";

export interface Job {
  id: string;
  type: string;
  status: JobStatus;
  payload: Record<string, any>;
  scheduledTime: string;
  startedAt?: string;
  completedAt?: string;
  retryCount: number;
  maxRetries: number;
  assignedWorker?: string;
  logs: string[];
  createdAt: string;
  updatedAt: string;
  error?: string
}

export interface Worker {
  id: string;
  name: string;
  status: WorkerStatus;
  currentJob?: string;
  processedJobs: number;
  lastHeartbeat: string;
  memoryUsage: number;
  cpuUsage: number;
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