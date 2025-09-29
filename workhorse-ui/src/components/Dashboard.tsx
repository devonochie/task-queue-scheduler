import { useEffect, useMemo } from "react";
import { Search, Plus, Filter, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OverviewCards } from "@/components/OverviewCards";
import { JobTable } from "@/components/JobTable";
import { JobDetailsPanel } from "@/components/JobDetailsPanel";
import { AddJobForm } from "@/components/AddJobForm";
import { WorkerStatusPanel } from "@/components/WorkerStatusPanel";
import { FiltersPanel } from "@/components/FiltersPanel";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { addJob, retryJob, cancelJob, deleteJob, selectJob, setSearchTerm, setStatusFilter, fetchJobs, clearError, retryJobThunk, cancelJobThunk, createJob, deleteJobThunk } from "@/store/slices/jobsSlice";
import { setShowAddForm, setShowFilters } from "@/store/slices/uiSlice";
import { CreateJobRequest, Job, JobStatus } from "@/types/dashboard";
import { fetchWorkers } from "@/store/slices/workersSlice";

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { jobs, selectedJobId, searchTerm, statusFilter, loading, error } = useAppSelector(state => state.jobs);
  const { workers } = useAppSelector(state => state.workers);
  const { showAddForm, showFilters } = useAppSelector(state => state.ui);
  const { toast } = useToast();

  useEffect(() => {
    dispatch(fetchJobs({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      type: searchTerm || undefined
    }))
  }, [dispatch, statusFilter, searchTerm ])

  useEffect(() => {
    dispatch(fetchWorkers())
  }, [dispatch])

  useEffect(() => {
    if(error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive'
      })
      dispatch(clearError())
    }
  }, [error, toast, dispatch])

  const selectedJob = useMemo(() => 
    jobs?.find(job => job.id === selectedJobId) || null, 
    [jobs, selectedJobId]
  );

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        job.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRetryJob = (jobId: string) => {
    try {
      dispatch(retryJobThunk(jobId)).unwrap();
      toast({
        title: "Job Retried",
        description: `Job ${jobId} has been queued for retry.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to retry job: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const handleCancelJob = (jobId: string) => {
    try {
      dispatch(cancelJobThunk(jobId)).unwrap();
      dispatch(deleteJobThunk(jobId))
      toast({
        title: "Job Cancelled",
        description: `Job ${jobId} has been cancelled.`,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to cancel job: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteJob = (jobId: string) => {
    try {
      dispatch(deleteJobThunk(jobId)).unwrap()
      toast({
        title: "Job Deleted",
        description: `Job ${jobId} has been permanently deleted.`,
        variant: "destructive",
      });
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete job: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }  
  };

  const handleAddJob = (newJob: CreateJobRequest) => {
    try {
      dispatch(createJob(newJob)).unwrap();
      dispatch(setShowAddForm(false));
      toast({
        title: "Job Added",
        description: `New ${newJob.type} job has been scheduled.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create job: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const getJobStats = () => {
    const total = jobs.length;
    const pending = jobs.filter(j => j.status === "pending").length;
    const running = jobs.filter(j => j.status === "running").length;
    const completed = jobs.filter(j => j.status === "completed").length;
    const failed = jobs.filter(j => j.status === "failed").length;
    
    return { total, pending, running, completed, failed };
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">Task Queue Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button onClick={() => dispatch(setShowAddForm(true))} className="bg-gradient-primary">
                <Plus className="mr-2 h-4 w-4" />
                Add Job
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Overview Cards */}
          <OverviewCards stats={getJobStats()} />

          {/* Worker Status */}
          <WorkerStatusPanel workers={workers} />

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs by ID or type..."
                value={searchTerm}
                onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => dispatch(setShowFilters(!showFilters))}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <FiltersPanel
              statusFilter={statusFilter}
              onStatusFilterChange={(status) => dispatch(setStatusFilter(status))}
            />
          )}

          {/* Job Table */}
          <div className="flex gap-8">
            <div className={`transition-all duration-300 ${selectedJob ? 'flex-1' : 'w-full'}`}>
              <JobTable
                jobs={filteredJobs}
                selectedJob={selectedJob}
                onSelectJob={(job) => dispatch(selectJob(job?.id || null))}
                onRetryJob={handleRetryJob}
                onCancelJob={handleCancelJob}
                onDeleteJob={handleDeleteJob}
                loading = {loading}
              />
            </div>

            {selectedJob && (
              <div className="w-96 animate-fade-in">
                <JobDetailsPanel
                  job={selectedJob}
                  onClose={() => dispatch(selectJob(null))}
                  onRetry={handleRetryJob}
                  onCancel={handleCancelJob}
                  onDelete={handleDeleteJob}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Job Modal */}
      {showAddForm && (
        <AddJobForm
          onSubmit={handleAddJob}
          onClose={() => dispatch(setShowAddForm(false))}
        />
      )}
    </div>
  );
};

export default Dashboard;