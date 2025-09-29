import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, CheckCircle, XCircle, Activity } from "lucide-react";
import { JobStats } from "@/types/dashboard";

interface OverviewCardsProps {
  stats: JobStats;
}

export const OverviewCards = ({ stats }: OverviewCardsProps) => {
  const cards = [
    {
      title: "Total Jobs",
      value: stats.total,
      icon: Activity,
      className: "bg-gradient-primary text-white",
      description: "All jobs in system"
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      className: "bg-status-pending text-status-pending-foreground",
      description: "Waiting to execute"
    },
    {
      title: "Running",
      value: stats.running,
      icon: TrendingUp,
      className: "bg-status-warning text-status-warning-foreground",
      description: "Currently processing"
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      className: "bg-status-success text-status-success-foreground",
      description: "Successfully finished"
    },
    {
      title: "Failed",
      value: stats.failed,
      icon: XCircle,
      className: "bg-status-error text-status-error-foreground",
      description: "Require attention"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="shadow-card hover:shadow-elevated transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.className}`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};