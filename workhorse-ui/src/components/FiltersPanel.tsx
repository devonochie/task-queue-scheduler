import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobStatus } from "@/types/dashboard";

interface FiltersPanelProps {
  statusFilter: JobStatus | "all";
  onStatusFilterChange: (status: JobStatus | "all") => void;
}

export const FiltersPanel = ({
  statusFilter,
  onStatusFilterChange,
}: FiltersPanelProps) => {
  const statusOptions: Array<{ value: JobStatus | "all"; label: string; className: string }> = [
    { value: "all", label: "All", className: "bg-secondary text-secondary-foreground" },
    { value: "pending", label: "Pending", className: "bg-status-pending-bg text-status-pending border-status-pending/20" },
    { value: "running", label: "Running", className: "bg-status-warning-bg text-status-warning border-status-warning/20" },
    { value: "completed", label: "Completed", className: "bg-status-success-bg text-status-success border-status-success/20" },
    { value: "failed", label: "Failed", className: "bg-status-error-bg text-status-error border-status-error/20" },
  ];

  return (
    <Card className="shadow-card animate-fade-in">
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-4">Filter by status:</span>
          {statusOptions.map((option) => (
            <Badge
              key={option.value}
              variant={statusFilter === option.value ? "default" : "outline"}
              className={`cursor-pointer transition-colors hover:opacity-80 ${
                statusFilter === option.value 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : option.className
              }`}
              onClick={() => onStatusFilterChange(option.value)}
            >
              {option.label}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};