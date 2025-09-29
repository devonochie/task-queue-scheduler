import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Cpu, MemoryStick, User, AlertTriangle } from "lucide-react";
import { Worker, WorkerStatus } from "@/types/dashboard";
import { formatDistanceToNow } from "date-fns";

interface WorkerStatusPanelProps {
  workers: Worker[];
}

export const WorkerStatusPanel = ({ workers }: WorkerStatusPanelProps) => {
  const getStatusBadge = (status: WorkerStatus) => {
    const variants = {
      active: "bg-status-success-bg text-status-success border-status-success/20",
      idle: "bg-status-pending-bg text-status-pending border-status-pending/20",
      failed: "bg-status-error-bg text-status-error border-status-error/20",
    };
    
    return (
      <Badge variant="outline" className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const activeWorkers = workers.filter(w => w.status === "active").length;
  const idleWorkers = workers.filter(w => w.status === "idle").length;
  const failedWorkers = workers.filter(w => w.status === "failed").length;

  return (
    <div className="space-y-6">
      {/* Worker Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-status-success-bg rounded-lg">
                <Activity className="h-5 w-5 text-status-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeWorkers}</p>
                <p className="text-sm text-muted-foreground">Active Workers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-status-pending-bg rounded-lg">
                <User className="h-5 w-5 text-status-pending" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{idleWorkers}</p>
                <p className="text-sm text-muted-foreground">Idle Workers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-status-error-bg rounded-lg">
                <AlertTriangle className="h-5 w-5 text-status-error" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{failedWorkers}</p>
                <p className="text-sm text-muted-foreground">Failed Workers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Worker Details */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Worker Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workers.map((worker) => (
              <div
                key={worker.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{worker.name}</h4>
                      {getStatusBadge(worker.status)}
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">{worker.id}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-8">
                  {/* Current Job */}
                  <div className="text-sm">
                    <p className="text-muted-foreground">Current Job</p>
                    <p className="font-mono">
                      {worker.currentJob || <span className="text-muted-foreground">None</span>}
                    </p>
                  </div>

                  {/* Processed Jobs */}
                  <div className="text-sm">
                    <p className="text-muted-foreground">Processed</p>
                    <p className="font-medium">{worker.processedJobs}</p>
                  </div>

                  {/* System Stats */}
                  <div className="flex space-x-4">
                    <div className="flex flex-col items-center space-y-1">
                      <div className="flex items-center space-x-1">
                        <Cpu className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">CPU</span>
                      </div>
                      <div className="w-16">
                        <Progress 
                          value={worker.cpuUsage} 
                          className="h-2"
                        />
                      </div>
                      <span className="text-xs font-mono">{worker.cpuUsage}%</span>
                    </div>

                    <div className="flex flex-col items-center space-y-1">
                      <div className="flex items-center space-x-1">
                        <MemoryStick className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">MEM</span>
                      </div>
                      <div className="w-16">
                        <Progress 
                          value={(worker.memoryUsage / 1024) * 100} 
                          className="h-2"
                        />
                      </div>
                      <span className="text-xs font-mono">{worker.memoryUsage}MB</span>
                    </div>
                  </div>

                  {/* Last Heartbeat */}
                  <div className="text-sm">
                    <p className="text-muted-foreground">Last Seen</p>
                    <p className="font-mono text-xs">
                      {formatDistanceToNow(new Date(worker.lastHeartbeat), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};