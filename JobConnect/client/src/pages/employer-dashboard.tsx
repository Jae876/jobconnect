import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  PlusCircle, 
  List, 
  Users, 
  Building, 
  Briefcase, 
  UserCheck, 
  Handshake,
  User,
  LogOut,
  MapPin,
  DollarSign,
  Clock,
  Calendar
} from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertJobSchema } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ProfileDropdown } from "@/components/ui/profile-dropdown";
import { InterviewScheduler, InterviewList } from "@/components/ui/interview-scheduler";

export default function EmployerDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);

  // Get current user
  const { data: authUser, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Get dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["/api/dashboard/employer"],
    enabled: !!authUser,
  });

  // Get interviews
  const { data: interviews = [], isLoading: interviewsLoading } = useQuery({
    queryKey: ["/api/interviews/employer"],
    enabled: !!authUser,
  });

  // Job posting form
  const form = useForm({
    resolver: zodResolver(insertJobSchema.omit({ employerId: true })),
    defaultValues: {
      title: "",
      description: "",
      department: "",
      employmentType: "full-time",
      workLocation: "onsite",
      salaryMin: undefined,
      salaryMax: undefined,
      location: "",
      requirements: [],
      benefits: [],
      requiredSkills: [],
      preferredSkills: [],
      responsibilities: [],
    },
  });

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/jobs", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job posted successfully!",
        description: "Your job posting is now live and visible to candidates.",
      });
      form.reset();
      setIsJobDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/employer"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to post job",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      setLocation("/");
    } catch (error) {
      setLocation("/");
    }
  };

  const onSubmit = (data: any) => {
    createJobMutation.mutate(data);
  };

  useEffect(() => {
    if (!userLoading && (!authUser || (authUser as any).user?.role !== "employer")) {
      setLocation("/");
    }
  }, [authUser, userLoading, setLocation]);

  if (userLoading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!authUser || (authUser as any).user?.role !== "employer") {
    return null;
  }

  const user = (authUser as any)?.user;
  const profile = (dashboardData as any)?.profile;
  const stats = (dashboardData as any)?.stats || { totalJobs: 0, activeJobs: 0, totalApplications: 0, interviewsScheduled: 0, averageRating: 0 };
  const activeJobs = (dashboardData as any)?.activeJobs || [];
  const recentApplications = (dashboardData as any)?.recentApplications || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">JobConnect</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user.firstName}</span>
              <ProfileDropdown user={user} onLogout={handleLogout} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Building className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {profile?.companyName || "Company"}
                  </h3>
                  <p className="text-gray-600">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-gray-500">{profile?.jobTitle}</p>
                  <p className="text-xs text-gray-400">{profile?.companyLocation}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Company Profile</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "90%" }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">90% Complete</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Active Jobs</span>
                      <Badge variant="secondary">{stats.activeJobs}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Applications</span>
                      <Badge variant="outline">{stats.totalApplications}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Interviews</span>
                      <Badge variant="outline">{stats.interviewsScheduled}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full justify-start" size="sm">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Post New Job
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Post a New Job</DialogTitle>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Job Title</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. Senior Developer" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="employmentType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Employment Type</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="full-time">Full-time</SelectItem>
                                      <SelectItem value="part-time">Part-time</SelectItem>
                                      <SelectItem value="contract">Contract</SelectItem>
                                      <SelectItem value="internship">Internship</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. San Francisco, CA" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="salaryMin"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Minimum Salary</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="e.g. 80000" 
                                      {...field}
                                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="salaryMax"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Maximum Salary</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="e.g. 120000" 
                                      {...field}
                                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Job Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                                    className="min-h-[100px]"
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
                              onClick={() => setIsJobDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={createJobMutation.isPending}>
                              {createJobMutation.isPending ? "Posting..." : "Post Job"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                  
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <List className="w-4 h-4 mr-2" />
                    Manage Jobs
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Users className="w-4 h-4 mr-2" />
                    View Candidates
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Building className="w-4 h-4 mr-2" />
                    Company Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
                    </div>
                    <Briefcase className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Applications</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                    </div>
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Interviews</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.interviewsScheduled}</p>
                    </div>
                    <UserCheck className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Rating</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                    </div>
                    <Handshake className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Jobs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Your Active Jobs ({activeJobs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeJobs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg">No active jobs yet</p>
                    <p className="text-sm">Post your first job to start attracting candidates</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => setIsJobDialogOpen(true)}
                    >
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Post Your First Job
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeJobs.map((job: any) => (
                      <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{job.title}</h3>
                            <p className="text-gray-600">{profile?.companyName}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{job.employmentType}</Badge>
                            <Badge variant={job.status === "active" ? "default" : "outline"}>
                              {job.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          {job.salaryMin && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDistanceToNow(new Date(job.createdAt))} ago
                          </span>
                        </div>
                        
                        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                          {job.description}
                        </p>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4 text-sm">
                            <span>{job.applicationsCount || 0} applications</span>
                            <span>{job.views || 0} views</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              View Applications
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Applications */}
            {recentApplications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Recent Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentApplications.slice(0, 5).map((application: any) => (
                      <div key={application.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">
                              {application.jobSeeker?.user?.firstName} {application.jobSeeker?.user?.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">Applied for: {application.job?.title}</p>
                            <p className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(application.appliedAt))} ago
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={application.status === "pending" ? "outline" : "secondary"}>
                            {application.status}
                          </Badge>
                          {application.status === "pending" && (
                            <InterviewScheduler 
                              applicationId={application.id}
                              candidateName={`${application.jobSeeker?.user?.firstName} ${application.jobSeeker?.user?.lastName}`}
                              jobTitle={application.job?.title}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Scheduled Interviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Scheduled Interviews ({(interviews as any[])?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <InterviewList interviews={(interviews as any[]) || []} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}