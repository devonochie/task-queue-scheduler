/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, RotateCcw, X, Trash2, ArrowUpDown } from "lucide-react";
import { Job, JobStatus } from "@/types/dashboard";
import { formatDistanceToNow } from "date-fns";

interface JobTableProps {
  jobs: Job[];
  selectedJob: Job | null;
  onSelectJob: (job: Job) => void;
  onRetryJob: (jobId: string) => void;
  onCancelJob: (jobId: string) => void;
  onDeleteJob: (jobId: string) => void;
  loading?: boolean
}

type SortField = "id" | "type" | "status" | "scheduledTime" | "retryCount";
type SortDirection = "asc" | "desc";

export const JobTable = ({
  jobs,
  selectedJob,
  onSelectJob,
  onRetryJob,
  onCancelJob,
  onDeleteJob,
  loading = false
}: JobTableProps) => {
  const [sortField, setSortField] = useState<SortField>("scheduledTime");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const getStatusBadge = (status: JobStatus) => {
    const variants = {
      pending: "bg-status-pending-bg text-status-pending border-status-pending/20",
      running: "bg-status-warning-bg text-status-warning border-status-warning/20",
      completed: "bg-status-success-bg text-status-success border-status-success/20",
      failed: "bg-status-error-bg text-status-error border-status-error/20",
    };
    
    return (
      <Badge variant="outline" className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedJobs = [...jobs].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === "scheduledTime") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
      </div>
    </TableHead>
  );

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading jobs...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">No jobs found</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Job Queue
          <span className="text-sm font-normal text-muted-foreground">
            {jobs.length} jobs
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader field="id">Job ID</SortableHeader>
                <SortableHeader field="type">Type</SortableHeader>
                <SortableHeader field="status">Status</SortableHeader>
                <SortableHeader field="scheduledTime">Scheduled</SortableHeader>
                <SortableHeader field="retryCount">Retries</SortableHeader>
                <TableHead>Worker</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedJobs.map((job) => (
                <TableRow
                  key={job.id}
                  className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedJob?.id === job.id ? "bg-muted" : ""
                  }`}
                  onClick={() => onSelectJob(job)}
                >
                  <TableCell className="font-mono text-sm">{job.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{job.type}</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(job.scheduledTime), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <span className={job.retryCount > 0 ? "text-destructive font-medium" : ""}>
                      {job.retryCount}/{job.maxRetries}
                    </span>
                  </TableCell>
                  <TableCell>
                    {job.assignedWorker ? (
                      <Badge variant="secondary" className="text-xs">
                        {job.assignedWorker}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border shadow-elevated">
                        {(job.status === "failed" || job.status === "completed") && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onRetryJob(job.id);
                            }}
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Retry
                          </DropdownMenuItem>
                        )}
                        {(job.status === "pending" || job.status === "running") && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onCancelJob(job.id);
                            }}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteJob(job.id);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};