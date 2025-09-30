import { CreateJobRequest, Job, JobStatus, WorkerStatus } from "@/types/dashboard";
import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: 'https://task-queue-scheduler.onrender.com/api',
    withCredentials: true
})

export const apiService = {
    async createJob(jobData: CreateJobRequest) {
        const response = await axiosInstance.post('/jobs', jobData)
        return response.data as Job
    },

    async getJobs(filter: {
        type?: string,
        status?: JobStatus | 'all',
        page?: number,
        limit?: number,
        startDate?: string,
        endDate?: string
    }){
        const params = new URLSearchParams()
        Object.entries(filter).forEach(([key,value]) => {
            if(value && value === 'all') {
                params.append(key, value.toString())
            }
        })

        const response = await axiosInstance.get(`/jobs/${params}`)
        return response.data.jobs
    },

    async getJob(id: string) {
        const response = await axiosInstance.get(`/jobs/${id}`)
        return response.data
    },

    async retryJob(id: string) {
        const response = await axiosInstance.post(`/jobs/${id}/retry`)
        return response.data
    },

    async cancelJob(id: string) {
        const response = await axiosInstance.delete(`/jobs/${id}`)
        return response.data
    },

    async deleteJobs(id: string) {
        const response = await axiosInstance.delete(`/jobs/${id}/delete`)
        return response.data
    },

    async getJobStats() {
        const response = await axios.get('/jobs')
        return response.data
    },
    
    async listWorkers() {
        const response = await axiosInstance.get('/workers')
        return response.data
    },

    async registerWorker() {
        const response = await axios.post('/workers/register')
        return response.data
    },

    async updateWorkerStatus(id: string, status: WorkerStatus) {
        const metrics = {
        memoryUsage: status === 'active' ? Math.random() * 50 + 30 : 
                    status === 'failed' ? Math.random() * 30 + 70 : 
                    Math.random() * 20 + 10,
        cpuUsage: status === 'active' ? Math.random() * 40 + 30 :
                 status === 'failed' ? Math.random() * 20 + 80 :
                 Math.random() * 10 + 2,
        currentJob: status === 'active' ? `job-${Math.random().toString(36).substr(2, 8)}` : null
    };
        const response = await axiosInstance.put(`workers/${id}/status`, {
            status,
            ...metrics
        })
        return response.data
    }
}
