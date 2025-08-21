import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, Users, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { z } from "zod";

// Form validation schema
const interviewFormSchema = z.object({
  type: z.enum(["video", "phone", "in-person"]),
  scheduledAt: z.string().min(1, "Date and time is required"),
  duration: z.number().min(15).max(480),
  meetingLink: z.string().optional(),
  notes: z.string().optional(),
  interviewers: z.string().optional(),
});

type InterviewFormData = z.infer<typeof interviewFormSchema>;

interface InterviewSchedulerProps {
  applicationId: string;
  candidateName: string;
  jobTitle: string;
}

export function InterviewScheduler({ applicationId, candidateName, jobTitle }: InterviewSchedulerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InterviewFormData>({
    resolver: zodResolver(interviewFormSchema),
    defaultValues: {
      type: "video",
      scheduledAt: "",
      duration: 60,
      meetingLink: "",
      notes: "",
      interviewers: "",
    },
  });

  const scheduleInterviewMutation = useMutation({
    mutationFn: async (data: InterviewFormData) => {
      // Send the datetime as string - server will convert to Date
      const interviewData = {
        applicationId,
        title: `Interview with ${candidateName} for ${jobTitle}`,
        description: data.notes || '',
        scheduledAt: data.scheduledAt, // Send as string
        duration: data.duration,
        type: data.type,
        location: data.meetingLink || (data.type === "in-person" ? "Office location TBD" : "Video call link TBD"),
      };

      const response = await apiRequest("POST", "/api/interviews", interviewData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Interview scheduled!",
        description: `Interview with ${candidateName} has been scheduled successfully.`,
      });
      form.reset();
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/employer"] });
      queryClient.invalidateQueries({ queryKey: ["/api/interviews"] });
    },
    onError: (error: any) => {
      console.error("Interview scheduling error:", error);
      toast({
        title: "Failed to schedule interview",
        description: error.message || "Please check all required fields and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InterviewFormData) => {
    // Validate the datetime is not empty and is in the future
    if (!data.scheduledAt) {
      toast({
        title: "Date and time required",
        description: "Please select a date and time for the interview.",
        variant: "destructive",
      });
      return;
    }

    const selectedDate = new Date(data.scheduledAt);
    const now = new Date();
    
    if (selectedDate <= now) {
      toast({
        title: "Invalid date",
        description: "Please select a future date and time for the interview.",
        variant: "destructive",
      });
      return;
    }

    scheduleInterviewMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Interview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
          <p className="text-sm text-gray-600">
            Schedule an interview with {candidateName} for {jobTitle}
          </p>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interview Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="video">
                          <div className="flex items-center">
                            <Video className="w-4 h-4 mr-2" />
                            Video Call
                          </div>
                        </SelectItem>
                        <SelectItem value="phone">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            Phone Call
                          </div>
                        </SelectItem>
                        <SelectItem value="in-person">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            In-Person
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="scheduledAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local" 
                      {...field}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="meetingLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {form.watch("type") === "in-person" ? "Location" : "Meeting Link"}
                    {form.watch("type") !== "in-person" && " *"}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={
                        form.watch("type") === "in-person" 
                          ? "Office address or meeting room" 
                          : "https://zoom.us/j/... or https://meet.google.com/..."
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interviewers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interviewers (comma-separated emails)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="john@company.com, jane@company.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interview Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any specific instructions or topics to cover..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={scheduleInterviewMutation.isPending}>
                {scheduleInterviewMutation.isPending ? "Scheduling..." : "Schedule Interview"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface InterviewListProps {
  interviews: any[];
}

export function InterviewList({ interviews }: InterviewListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateInterviewMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PUT", `/api/interviews/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Interview updated",
        description: "Interview status has been updated.",
      });
      // Invalidate all interview-related queries
      queryClient.invalidateQueries({ queryKey: ["/api/interviews/employer"] });
      queryClient.invalidateQueries({ queryKey: ["/api/interviews/job-seeker"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/employer"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/job-seeker"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update interview.",
        variant: "destructive",
      });
    },
  });

  if (interviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p>No interviews scheduled yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {interviews.map((interview: any) => (
        <Card key={interview.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold">{interview.title}</h4>
                <p className="text-sm text-gray-600">
                  {interview.application?.jobSeeker ? 
                    `${interview.application.jobSeeker.user?.firstName} ${interview.application.jobSeeker.user?.lastName}` :
                    interview.application?.job?.title
                  }
                </p>
                {interview.application?.job?.title && (
                  <p className="text-xs text-gray-500">Position: {interview.application.job.title}</p>
                )}
                {interview.application?.jobSeeker?.user?.email && (
                  <p className="text-xs text-gray-500">Contact: {interview.application.jobSeeker.user.email}</p>
                )}
              </div>
              <Badge variant={
                interview.status === "scheduled" ? "default" :
                interview.status === "completed" ? "secondary" :
                interview.status === "cancelled" ? "destructive" : "outline"
              }>
                {interview.status}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(interview.scheduledAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(interview.scheduledAt).toLocaleTimeString()}
              </span>
              <span className="flex items-center gap-1">
                {interview.type === "video" ? <Video className="w-4 h-4" /> : 
                 interview.type === "phone" ? <Clock className="w-4 h-4" /> : 
                 <MapPin className="w-4 h-4" />}
                {interview.type}
              </span>
              <span>{interview.duration} min</span>
            </div>

            {interview.location && (
              <div className="mb-3 p-2 bg-blue-50 rounded border">
                <p className="text-sm font-medium text-gray-700">
                  {interview.type === "video" ? "Meeting Link:" :
                   interview.type === "phone" ? "Phone Details:" : 
                   "Location:"}
                </p>
                {interview.location.startsWith('http') ? (
                  <a 
                    href={interview.location} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {interview.location}
                  </a>
                ) : (
                  <p className="text-sm text-gray-600">{interview.location}</p>
                )}
              </div>
            )}

            {interview.description && (
              <div className="mb-3 p-2 bg-gray-50 rounded">
                <p className="text-sm font-medium text-gray-700 mb-1">Interview Notes:</p>
                <p className="text-sm text-gray-700">{interview.description}</p>
              </div>
            )}

            {interview.feedback && (
              <div className="mb-3 p-2 bg-green-50 rounded border border-green-200">
                <p className="text-sm font-medium text-green-700 mb-1">Interview Feedback:</p>
                <p className="text-sm text-green-700">{interview.feedback}</p>
              </div>
            )}

            <div className="flex gap-2">
              {interview.status === "scheduled" && (
                <>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateInterviewMutation.mutate({ id: interview.id, status: "completed" })}
                  >
                    Mark Complete
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateInterviewMutation.mutate({ id: interview.id, status: "cancelled" })}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}