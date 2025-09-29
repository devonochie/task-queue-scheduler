import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { CreateJobRequest, Job, JobStatus } from "@/types/dashboard";
import { useToast } from "@/hooks/use-toast";

interface AddJobFormProps {
  onSubmit: (job: CreateJobRequest) => void;
  onClose: () => void;
}

const jobTypes = [
  "email-send",
  "data-processing",
  "image-resize",
  "report-generation",
  "backup-database",
  "webhook-delivery",
  "video-processing",
  "pdf-generation",
  "batch-import",
  "cleanup-task"
];

export const AddJobForm = ({ onSubmit, onClose }: AddJobFormProps) => {
  const [formData, setFormData] = useState({
    type: "",
    payload: "{}",
    scheduledTime: new Date(),
    maxRetries: 3,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.type) {
      newErrors.type = "Job type is required";
    }

    try {
      JSON.parse(formData.payload);
    } catch {
      newErrors.payload = "Payload must be valid JSON";
    }

    if (formData.maxRetries < 0 || formData.maxRetries > 10) {
      newErrors.maxRetries = "Max retries must be between 0 and 10";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const payload = JSON.parse(formData.payload);
      
      const job: CreateJobRequest = {
        type: formData.type,
        payload,
        scheduleTime: formData.scheduledTime.toISOString(),
        retryPolicy: {
          maxAttempts: formData.maxRetries,
          delay: 0
        },
      };

      onSubmit(job);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create job. Please check your input.",
        variant: "destructive",
      });
    }
  };

  const setPayloadExample = (type: string) => {
    const examples: Record<string, object> = {
      "email-send": {
        to: "user@example.com",
        subject: "Subject here",
        body: "body_name",
        variables: {}
      },
      "data-processing": {
        dataset: "dataset_name",
        operation: "aggregate",
        filters: {}
      },
      "image-resize": {
        source: "path/to/image.jpg",
        sizes: [100, 200, 400],
        format: "webp"
      },
      "report-generation": {
        report_type: "monthly_sales",
        format: "pdf",
        recipients: ["manager@example.com"]
      },
      "webhook-delivery": {
        url: "https://api.example.com/webhook",
        event: "event_name",
        data: {}
      }
    };

    const example = examples[type] || {};
    setFormData(prev => ({
      ...prev,
      payload: JSON.stringify(example, null, 2)
    }));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Plus className="mr-2 h-5 w-5" />
            Schedule New Job
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Job Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, type: value }));
                setPayloadExample(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select job type..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border shadow-elevated">
                {jobTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type}</p>
            )}
          </div>

          {/* Payload */}
          <div className="space-y-2">
            <Label htmlFor="payload">Payload (JSON)</Label>
            <Textarea
              id="payload"
              placeholder="Enter job payload as JSON..."
              value={formData.payload}
              onChange={(e) => setFormData(prev => ({ ...prev, payload: e.target.value }))}
              className="font-mono text-sm min-h-[120px]"
            />
            {errors.payload && (
              <p className="text-sm text-destructive">{errors.payload}</p>
            )}
          </div>

          {/* Scheduled Time */}
          <div className="space-y-2">
            <Label>Scheduled Time</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(formData.scheduledTime, "PPP 'at' p")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover border shadow-elevated">
                <Calendar
                  mode="single"
                  selected={formData.scheduledTime}
                  onSelect={(date) => {
                    if (date) {
                      const newDate = new Date(date);
                      newDate.setHours(formData.scheduledTime.getHours());
                      newDate.setMinutes(formData.scheduledTime.getMinutes());
                      setFormData(prev => ({ ...prev, scheduledTime: newDate }));
                    }
                  }}
                  initialFocus
                />
                <div className="p-3 border-t">
                  <Input
                    type="time"
                    value={format(formData.scheduledTime, "HH:mm")}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(":").map(Number);
                      const newDate = new Date(formData.scheduledTime);
                      newDate.setHours(hours, minutes);
                      setFormData(prev => ({ ...prev, scheduledTime: newDate }));
                    }}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Max Retries */}
          <div className="space-y-2">
            <Label htmlFor="maxRetries">Max Retries</Label>
            <Input
              id="maxRetries"
              type="number"
              min="0"
              max="10"
              value={formData.maxRetries}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                maxRetries: parseInt(e.target.value) || 0 
              }))}
            />
            {errors.maxRetries && (
              <p className="text-sm text-destructive">{errors.maxRetries}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              Schedule Job
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};