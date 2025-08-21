import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, User, Building, X, Plus, ArrowLeft } from "lucide-react";
import { jobSeekerRegistrationSchema, employerRegistrationSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Create a credentials-only schema for the second step
const credentialsOnlySchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegistrationRole = "job_seeker" | "employer" | null;
type JobSeekerStep = "profile" | "credentials";

export default function Registration() {
  const [selectedRole, setSelectedRole] = useState<RegistrationRole>(null);
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState<JobSeekerStep>("profile");
  const [profileData, setProfileData] = useState<any>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  // Popular skill suggestions for different roles
  const skillSuggestions = [
    // Technical Skills
    "JavaScript", "Python", "React", "Node.js", "TypeScript", "HTML/CSS", "SQL", "AWS", "Docker", "Git",
    // Marketing Skills
    "Digital Marketing", "Social Media Marketing", "SEO/SEM", "Content Marketing", "Email Marketing", "Google Analytics", "PPC Advertising", "Brand Management",
    // Business Skills
    "Project Management", "Data Analysis", "Business Strategy", "Sales", "Customer Service", "Leadership", "Communication", "Problem Solving",
    // Design Skills
    "UI/UX Design", "Graphic Design", "Adobe Creative Suite", "Figma", "Sketch", "Web Design", "Branding",
    // Other Professional Skills
    "Microsoft Office", "Excel", "PowerPoint", "Presentation Skills", "Time Management", "Team Collaboration", "Research", "Writing"
  ];
  const { toast } = useToast();

  // Skill management functions
  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  // No URL parameter handling - users choose role within the form

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async ({ data, role }: { data: any, role: string }) => {
      const endpoint = role === "job_seeker" ? "/api/auth/register/job-seeker" : "/api/auth/register/employer";
      console.log("Registering user:", { endpoint, data });
      return await apiRequest("POST", endpoint, data);
    },
    onSuccess: (data, variables) => {
      console.log("Registration successful:", data);
      toast({
        title: "Account created successfully!",
        description: "You can now access your dashboard",
      });

      // Redirect to appropriate dashboard based on role
      setTimeout(() => {
        if (variables.role === "job_seeker") {
          window.location.href = "/dashboard/job-seeker";
        } else {
          window.location.href = "/dashboard/employer";
        }
      }, 1000);
    },
    onError: (error: any) => {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Please check your information and try again",
        variant: "destructive",
      });
    },
  });

  // Profile form (step 1 for job seekers)
  const profileForm = useForm({
    defaultValues: {
      bio: "",
      professionalTitle: "",
      yearsExperience: "",
      location: "",
      expectedSalaryMin: "",
      expectedSalaryMax: "",
      salaryType: "yearly" as const,
      workPreference: "remote" as const,
      availability: "",
      openToRelocate: false,
    },
  });

  // Credentials form (step 2 for job seekers) - Reset form when step changes
  const credentialsForm = useForm({
    resolver: zodResolver(credentialsOnlySchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  // Reset credentials form when moving to credentials step
  React.useEffect(() => {
    if (currentStep === "credentials") {
      credentialsForm.reset({
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
      // Force clear the form values
      credentialsForm.setValue("username", "");
      credentialsForm.setValue("email", "");
      credentialsForm.setValue("firstName", "");
      credentialsForm.setValue("lastName", "");
      credentialsForm.setValue("phone", "");
      credentialsForm.setValue("password", "");
      credentialsForm.setValue("confirmPassword", "");
    }
  }, [currentStep, credentialsForm]);

  // Employer form
  const employerForm = useForm({
    resolver: zodResolver(employerRegistrationSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      bio: "",
      password: "",
      confirmPassword: "",
      jobTitle: "",
      companyName: "",
      companySize: "",
      industry: "",
      companyLocation: "",
      companyDescription: "",
      website: "",
      foundedYear: "",
      remotePolicy: "",
    },
  });

  const handleRoleSelection = (role: RegistrationRole) => {
    setSelectedRole(role);
  };

  const handleProceedToForm = () => {
    if (selectedRole) {
      setShowForm(true);
    }
  };



  // Handle profile submission (job seeker step 1)
  const handleProfileSubmit = (data: any) => {
    console.log("Profile data submitted:", data);
    const processedData = {
      ...data,
      skills,
      expectedSalaryMin: data.expectedSalaryMin ? parseInt(data.expectedSalaryMin) : undefined,
      expectedSalaryMax: data.expectedSalaryMax ? parseInt(data.expectedSalaryMax) : undefined,
    };
    setProfileData(processedData);
    setCurrentStep("credentials");
  };

  // Handle credentials submission (job seeker step 2)
  const handleCredentialsSubmit = async (data: any) => {
    console.log("Credentials submitted:", data);
    console.log("Profile data:", profileData);

    const fullRegistrationData = {
      // Credentials
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      password: data.password,
      confirmPassword: data.confirmPassword,
      // Profile data
      bio: profileData.bio,
      professionalTitle: profileData.professionalTitle,
      yearsExperience: profileData.yearsExperience,
      skills: profileData.skills,
      location: profileData.location,
      expectedSalaryMin: profileData.expectedSalaryMin,
      expectedSalaryMax: profileData.expectedSalaryMax,
      salaryType: profileData.salaryType,
      workPreference: profileData.workPreference,
      availability: profileData.availability,
      openToRelocate: profileData.openToRelocate,
    };

    console.log("Complete job seeker registration data:", fullRegistrationData);
    registerMutation.mutate({ data: fullRegistrationData, role: "job_seeker" });
  };

  // Handle employer registration
  const handleEmployerSubmit = async (data: any) => {
    console.log("Employer registration data:", data);
    const processedData = {
      ...data,
      foundedYear: data.foundedYear ? parseInt(data.foundedYear) : undefined,
    };
    registerMutation.mutate({ data: processedData, role: "employer" });
  };

  if (!showForm && !selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Join JobConnect
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Create your account and access your dashboard
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedRole === "job_seeker" ? "ring-2 ring-blue-500 shadow-lg" : ""
              }`}
              onClick={() => handleRoleSelection("job_seeker")}
            >
              <CardHeader className="text-center">
                <User className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                <CardTitle className="text-2xl">Job Seeker</CardTitle>
                <p className="text-gray-600 dark:text-gray-400">
                  Find opportunities and access your dashboard
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Browse job opportunities
                  </li>
                  <li className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Manage applications
                  </li>
                  <li className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Track interview progress
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedRole === "employer" ? "ring-2 ring-blue-500 shadow-lg" : ""
              }`}
              onClick={() => handleRoleSelection("employer")}
            >
              <CardHeader className="text-center">
                <Building className="w-12 h-12 mx-auto text-green-600 mb-4" />
                <CardTitle className="text-2xl">Employer</CardTitle>
                <p className="text-gray-600 dark:text-gray-400">
                  Post jobs and access your dashboard
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Post job listings
                  </li>
                  <li className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Review candidates
                  </li>
                  <li className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Schedule interviews
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {selectedRole && (
            <div className="text-center mt-8">
              <Button onClick={handleProceedToForm} size="lg" className="px-8">
                Continue as {selectedRole === "job_seeker" ? "Job Seeker" : "Employer"}
              </Button>
            </div>
          )}

          <div className="text-center mt-8">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            {selectedRole === "job_seeker" ? (
              <>
                <User className="w-6 h-6" />
                Job Seeker Registration
                {currentStep === "profile" && " - Step 1: Profile"}
                {currentStep === "credentials" && " - Step 2: Account"}
              </>
            ) : (
              <>
                <Building className="w-6 h-6" />
                Employer Registration
              </>
            )}
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            {selectedRole === "job_seeker" && currentStep === "profile" && "Tell us about your professional background"}
            {selectedRole === "job_seeker" && currentStep === "credentials" && "Create your login credentials"}
            {selectedRole === "employer" && "Create your account credentials"}
          </p>
        </CardHeader>
        <CardContent>
          {selectedRole === "job_seeker" ? (
            currentStep === "profile" ? (
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-6">
                  <FormField
                    control={profileForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Bio</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Tell us about your professional experience..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="professionalTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Software Developer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="yearsExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. New York, NY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel>Skills * (Select at least one)</FormLabel>
                    
                    {/* Skill Suggestions */}
                    <div className="mb-3">
                      <p className="text-sm text-muted-foreground mb-2">Popular Skills - Click to add:</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {skillSuggestions.filter(suggestion => !skills.includes(suggestion)).slice(0, 12).map((suggestion) => (
                          <Badge
                            key={suggestion}
                            variant="outline"
                            className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs"
                            onClick={() => {
                              if (!skills.includes(suggestion)) {
                                setSkills([...skills, suggestion]);
                              }
                            }}
                          >
                            + {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Custom Skill Input */}
                    <div className="flex gap-2">
                      <Input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        placeholder="Add a custom skill"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                      />
                      <Button type="button" onClick={addSkill} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <X className="w-3 h-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                        </Badge>
                      ))}
                    </div>
                    
                    {skills.length === 0 && (
                      <p className="text-sm text-red-500 mt-1">Please add at least one skill</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="expectedSalaryMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Salary Min</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 50000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="expectedSalaryMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Salary Max</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 80000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Continue to Account Setup
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...credentialsForm}>
                <form onSubmit={credentialsForm.handleSubmit(handleCredentialsSubmit)} className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm"
                      onClick={() => setCurrentStep("profile")}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Profile
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Username</label>
                      <Input 
                        placeholder="Choose a unique username"
                        {...credentialsForm.register("username")}
                      />
                      {credentialsForm.formState.errors.username && (
                        <p className="text-sm text-red-500 mt-1">
                          {credentialsForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input 
                        type="email"
                        placeholder="your.email@example.com"
                        {...credentialsForm.register("email")}
                      />
                      {credentialsForm.formState.errors.email && (
                        <p className="text-sm text-red-500 mt-1">
                          {credentialsForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={credentialsForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={credentialsForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={credentialsForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Create a secure password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={credentialsForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirm your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={credentialsForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="Your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating Account..." : "Create Job Seeker Account"}
                  </Button>
                </form>
              </Form>
            )
          ) : (
            <Form {...employerForm}>
              <form onSubmit={employerForm.handleSubmit(handleEmployerSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={employerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Choose a unique username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={employerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your.email@company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={employerForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={employerForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={employerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Create a secure password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={employerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirm your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={employerForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="Your phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={employerForm.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Company Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={employerForm.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Hiring Manager" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? "Creating Account..." : "Create Employer Account"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}