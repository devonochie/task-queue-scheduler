import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, RotateCcw, Trash2, Clock, User, Calendar, RefreshCw } from "lucide-react";
import { Job, JobStatus } from "@/types/dashboard";
import { formatDistanceToNow, format } from "date-fns";

interface JobDetailsPanelProps {
  job: Job;
  onClose: () => void;
  onRetry: (jobId: string) => void;
  onCancel: (jobId: string) => void;
  onDelete: (jobId: string) => void;
}

export const JobDetailsPanel = ({
  job,
  onClose,
  onRetry,
  onCancel,
  onDelete,
}: JobDetailsPanelProps) => {
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

  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), "MMM dd, yyyy 'at' HH:mm:ss");
  };

  return (
    <Card className="h-fit shadow-elevated">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Job Details</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Job Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Status</span>
            {getStatusBadge(job.status)}
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Job ID</span>
              <p className="font-mono mt-1">{job.id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Type</span>
              <p className="font-medium mt-1">{job.type}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Retries</span>
              <p className={`mt-1 ${job.retryCount > 0 ? 'text-destructive font-medium' : ''}`}>
                {job.retryCount}/{job.maxRetries}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Worker</span>
              <p className="mt-1">
                {job.assignedWorker ? (
                  <Badge variant="secondary" className="text-xs">
                    {job.assignedWorker}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">Not assigned</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Timestamps */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            Timeline
          </h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span className="font-mono">{formatTimestamp(job.createdAt)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Scheduled</span>
              <span className="font-mono">{formatTimestamp(job.scheduledTime)}</span>
            </div>
            
            {job.startedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Started</span>
                <span className="font-mono">{formatTimestamp(job.startedAt)}</span>
              </div>
            )}
            
            {job.completedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-mono">{formatTimestamp(job.completedAt)}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated</span>
              <span className="font-mono">{formatTimestamp(job.updatedAt)}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Payload */}
        <div className="space-y-3">
          <h4 className="font-medium">Payload</h4>
          <div className="bg-muted rounded-lg p-3">
            <pre className="text-xs font-mono whitespace-pre-wrap text-muted-foreground">
              {JSON.stringify(job.payload, null, 2)}
            </pre>
          </div>
        </div>

        <Separator />

        {/* Logs */}
        <div className="space-y-3">
          <h4 className="font-medium">Execution Logs</h4>
          <ScrollArea className="h-32 bg-muted rounded-lg p-3">
            <div className="space-y-1">
              {job.logs.map((log, index) => (
                <div key={index} className="text-xs font-mono text-muted-foreground">
                  {log}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {(job.status === "failed" || job.status === "completed") && (
            <Button
              onClick={() => onRetry(job.id)}
              className="w-full"
              variant="outline"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Retry Job
            </Button>
          )}
          
          {(job.status === "pending" || job.status === "running") && (
            <Button
              onClick={() => onCancel(job.id)}
              className="w-full"
              variant="outline"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel Job
            </Button>
          )}
          
          <Button
            onClick={() => onDelete(job.id)}
            className="w-full"
            variant="destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Job
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};