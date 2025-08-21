import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Search, User, FileText, Bell, Heart, MapPin, DollarSign, Clock, Briefcase, Building2, Filter, Star, TrendingUp, Users, Calendar, Bookmark, Send, ChevronRight, Eye, MessageSquare } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ProfileDropdown } from "@/components/ui/profile-dropdown";
import { InterviewList } from "@/components/ui/interview-scheduler";

export default function JobSeekerDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState("");
  const [salaryRangeFilter, setSalaryRangeFilter] = useState("");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("discover");

  // Get current user
  const { data: authUser, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Get dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["/api/dashboard/job-seeker"],
    enabled: !!authUser,
  });

  // Get jobs
  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/jobs"],
  });

  // Get interviews for job seeker
  const { data: interviews = [], isLoading: interviewsLoading } = useQuery({
    queryKey: ["/api/interviews/job-seeker"],
    enabled: !!authUser,
  });

  // Apply to job mutation
  const applyMutation = useMutation({
    mutationFn: async ({ jobId, coverLetter }: { jobId: string; coverLetter: string }) => {
      const response = await apiRequest("POST", "/api/applications", { jobId, coverLetter });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application submitted!",
        description: "Your application has been sent to the employer.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/job-seeker"] });
      setSelectedJob(null);
      setCoverLetter("");
    },
    onError: (error: any) => {
      toast({
        title: "Application failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleQuickApply = (jobId: string) => {
    applyMutation.mutate({ 
      jobId, 
      coverLetter: "I am interested in this position and believe my skills and experience make me a strong candidate. I would love to discuss this opportunity further." 
    });
  };

  useEffect(() => {
    if (!userLoading && (!authUser || (authUser as any).user?.role !== "job_seeker")) {
      setLocation("/login");
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

  if (!authUser || (authUser as any).user?.role !== "job_seeker") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need to be logged in as a job seeker to view this page.</p>
          <Button onClick={() => setLocation("/login")} className="mt-4">
            Login
          </Button>
        </div>
      </div>
    );
  }

  const user = (authUser as any).user;
  const profile = (dashboardData as any)?.profile;
  const stats = (dashboardData as any)?.stats || { totalApplications: 0, pendingApplications: 0, interviewsScheduled: 0, savedJobsCount: 0 };
  const applications = (dashboardData as any)?.recentApplications || [];
  
  // Update stats to include actual interview count
  const actualStats = {
    ...stats,
    interviewsScheduled: (interviews as any[])?.length || 0,
  };

  // Enhanced job filtering with multiple criteria
  const filteredJobs = (jobs as any[]).filter((job: any) => {
    const matchesSearch = !searchTerm || 
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.requiredSkills?.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = !locationFilter || 
      job.location?.toLowerCase().includes(locationFilter.toLowerCase());
    
    const matchesEmploymentType = !employmentTypeFilter || 
      job.employmentType === employmentTypeFilter;
    
    const matchesSalaryRange = !salaryRangeFilter || 
      (job.salaryMin && job.salaryMax && salaryRangeFilter === "50k-100k" && job.salaryMin >= 50000 && job.salaryMax <= 100000) ||
      (job.salaryMin && job.salaryMax && salaryRangeFilter === "100k+" && job.salaryMin >= 100000);
    
    return matchesSearch && matchesLocation && matchesEmploymentType && matchesSalaryRange;
  });

  // Generate AI cover letter
  const generateCoverLetter = (job: any) => {
    const template = `Dear Hiring Manager,

I am writing to express my strong interest in the ${job.title} position at ${job.companyName}. With my background in ${profile?.professionalTitle || 'professional experience'} and ${profile?.yearsExperience || 'several'} years of experience, I am confident I can contribute meaningfully to your team.

My skills in ${profile?.skills?.slice(0, 3).join(', ') || 'relevant technologies'} align well with your requirements. I am particularly drawn to this opportunity because of ${job.companyName}'s reputation and the challenging nature of this role.

I would welcome the opportunity to discuss how my experience and enthusiasm can benefit your organization. Thank you for considering my application.

Best regards,
${user?.firstName} ${user?.lastName}`;
    
    setCoverLetter(template);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">JobConnect</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                <Button variant="ghost" size="sm">
                  <Bell className="w-4 h-4" />
                  <span className="ml-2">Notifications</span>
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageSquare className="w-4 h-4" />
                  <span className="ml-2">Messages</span>
                </Button>
              </div>
              <ProfileDropdown user={user} onLogout={() => setLocation("/")} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg">{user?.firstName} {user?.lastName}</h3>
                  <p className="text-gray-600 text-sm">{profile?.professionalTitle || 'Professional'}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {profile?.location || 'Location not set'}
                  </p>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Profile Views</span>
                    <span className="text-sm font-medium">47</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Search Appearances</span>
                    <span className="text-sm font-medium">23</span>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <h4 className="font-medium text-sm mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {profile?.skills?.slice(0, 4).map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    )) || <p className="text-xs text-gray-500">No skills added</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Your Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm">Applications</span>
                  </div>
                  <span className="font-medium">{stats.totalApplications}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-orange-600 mr-2" />
                    <span className="text-sm">Pending</span>
                  </div>
                  <span className="font-medium">{stats.pendingApplications}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm">Interviews</span>
                  </div>
                  <span className="font-medium">{actualStats.interviewsScheduled}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bookmark className="w-4 h-4 text-purple-600 mr-2" />
                    <span className="text-sm">Saved Jobs</span>
                  </div>
                  <span className="font-medium">{stats.savedJobsCount}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="discover">Discover Jobs</TabsTrigger>
                <TabsTrigger value="applications">My Applications</TabsTrigger>
                <TabsTrigger value="interviews">Interviews</TabsTrigger>
                <TabsTrigger value="insights">Career Insights</TabsTrigger>
              </TabsList>

              {/* Discover Jobs Tab */}
              <TabsContent value="discover" className="space-y-6">
                {/* Search and Filters */}
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Search jobs by title, company, or skills..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowFilters(!showFilters)}
                        >
                          <Filter className="w-4 h-4 mr-2" />
                          Filters
                        </Button>
                      </div>
                      
                      {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Location</label>
                            <Input
                              placeholder="City, state..."
                              value={locationFilter}
                              onChange={(e) => setLocationFilter(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Job Type</label>
                            <Select value={employmentTypeFilter || undefined} onValueChange={setEmploymentTypeFilter}>
                              <SelectTrigger>
                                <SelectValue placeholder="All types" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="full_time">Full Time</SelectItem>
                                <SelectItem value="part_time">Part Time</SelectItem>
                                <SelectItem value="contract">Contract</SelectItem>
                                <SelectItem value="remote">Remote</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Salary Range</label>
                            <Select value={salaryRangeFilter || undefined} onValueChange={setSalaryRangeFilter}>
                              <SelectTrigger>
                                <SelectValue placeholder="Any salary" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="50k-100k">$50k - $100k</SelectItem>
                                <SelectItem value="100k+">$100k+</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-end">
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setLocationFilter("");
                                setEmploymentTypeFilter("");
                                setSalaryRangeFilter("");
                                setSearchTerm("");
                              }}
                              className="w-full"
                            >
                              Clear All
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Job Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-500 mr-2" />
                      Recommended for You
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Based on your profile and preferences, here are jobs that match your skills.
                    </p>
                    {jobsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : filteredJobs.length === 0 ? (
                      <div className="text-center py-8">
                        <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                        <p className="text-gray-600">Try adjusting your search criteria or check back later for new opportunities.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredJobs.map((job: any) => (
                          <div key={job.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                                <div className="flex items-center text-gray-600 mb-2">
                                  <Building2 className="w-4 h-4 mr-1" />
                                  <span className="mr-4">{job.companyName}</span>
                                  <MapPin className="w-4 h-4 mr-1" />
                                  <span>{job.location}</span>
                                </div>
                                <div className="flex items-center text-gray-600 mb-3">
                                  <DollarSign className="w-4 h-4 mr-1" />
                                  <span>
                                    {job.salaryMin && job.salaryMax 
                                      ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`
                                      : 'Salary not disclosed'
                                    }
                                  </span>
                                  <Clock className="w-4 h-4 ml-4 mr-1" />
                                  <span>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                                </div>
                                <p className="text-gray-700 mb-3 line-clamp-2">{job.description}</p>
                                {job.requiredSkills && job.requiredSkills.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    {job.requiredSkills.slice(0, 4).map((skill: string, index: number) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                    {job.requiredSkills.length > 4 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{job.requiredSkills.length - 4} more
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex space-x-2">
                                <Button 
                                  onClick={() => setSelectedJob(job)}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Send className="w-4 h-4 mr-2" />
                                  Apply Now
                                </Button>
                                <Button 
                                  variant="outline"
                                  onClick={() => handleQuickApply(job.id)}
                                  disabled={applyMutation.isPending}
                                >
                                  Quick Apply
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Bookmark className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Eye className="w-4 h-4 mr-1" />
                                <span>View Details</span>
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* My Applications Tab */}
              <TabsContent value="applications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Application History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {applications.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                        <p className="text-gray-600 mb-4">Start applying to jobs to see your application history here.</p>
                        <Button onClick={() => setActiveTab("discover")}>
                          Browse Jobs
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {applications.map((application: any) => (
                          <div key={application.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{application.job?.title}</h4>
                                <p className="text-sm text-gray-600">{application.job?.companyName}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Applied {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                              <Badge 
                                variant={
                                  application.status === 'pending' ? 'secondary' :
                                  application.status === 'reviewed' ? 'default' :
                                  application.status === 'interview' ? 'default' :
                                  'destructive'
                                }
                              >
                                {application.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Interviews Tab */}
              <TabsContent value="interviews" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Interview Schedule ({(interviews as any[])?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {interviewsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading interviews...</p>
                      </div>
                    ) : (interviews as any[])?.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews scheduled</h3>
                        <p className="text-gray-600">Your upcoming interviews will appear here once you advance in the application process.</p>
                      </div>
                    ) : (
                      <InterviewList interviews={(interviews as any[]) || []} />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Career Insights Tab */}
              <TabsContent value="insights" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                        Profile Strength
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm">Profile Completeness</span>
                            <span className="text-sm font-medium">75%</span>
                          </div>
                          <Progress value={75} className="h-2" />
                        </div>
                        <div className="text-sm text-gray-600 space-y-2">
                          <p>✅ Profile photo added</p>
                          <p>✅ Skills listed</p>
                          <p>⚠️ Add more work experience</p>
                          <p>⚠️ Get recommendations</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="w-5 h-5 text-blue-600 mr-2" />
                        Market Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600">Average salary for {profile?.professionalTitle}:</p>
                          <p className="text-lg font-semibold">$75,000 - $120,000</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Jobs posted this week:</p>
                          <p className="text-lg font-semibold">1,247</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Your profile matches:</p>
                          <p className="text-lg font-semibold">89% of jobs</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Job Application Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Apply to {selectedJob?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium">{selectedJob?.title}</h4>
              <p className="text-sm text-gray-600">{selectedJob?.companyName} • {selectedJob?.location}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Cover Letter</label>
              <Textarea
                placeholder="Write a compelling cover letter..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={8}
                className="resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateCoverLetter(selectedJob)}
                >
                  Generate AI Cover Letter
                </Button>
                <span className="text-xs text-gray-500">{coverLetter.length}/1000 characters</span>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setSelectedJob(null)}>
                Cancel
              </Button>
              <Button 
                onClick={() => applyMutation.mutate({ jobId: selectedJob.id, coverLetter })}
                disabled={!coverLetter.trim() || applyMutation.isPending}
              >
                {applyMutation.isPending ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}