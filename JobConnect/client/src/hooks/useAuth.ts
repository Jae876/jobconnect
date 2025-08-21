import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, type AuthUser, type AuthResponse } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { 
  JobSeekerRegistration,
  EmployerRegistration,
  LoginForm,
} from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: authApi.getCurrentUser,
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (credentials: LoginForm) => authApi.login(credentials),
    onSuccess: (data: AuthResponse) => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });

      // Redirect based on role
      if (data.role === "job_seeker") {
        window.location.href = "/dashboard/job-seeker";
      } else if (data.role === "employer") {
        window.location.href = "/dashboard/employer";
      }
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ data, role }: { data: JobSeekerRegistration | EmployerRegistration, role: "job-seeker" | "employer" }) => 
      authApi.register(data, role),
    onSuccess: (data: AuthResponse) => {
      console.log("🔥 useRegister onSuccess called with data:", data);
      
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Registration successful",
        description: "Welcome to JobConnect!",
      });

      // Redirect based on role immediately - let the dashboard handle loading states
      console.log("🔥 About to redirect for role:", data.role);
      if (data.role === "job_seeker") {
        console.log("🔥 REDIRECTING to job-seeker dashboard NOW");
        window.location.href = "/dashboard/job-seeker";
      } else if (data.role === "employer") {
        console.log("🔥 REDIRECTING to employer dashboard NOW");
        window.location.href = "/dashboard/employer";
      }
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });

      // Redirect to landing page
      window.location.href = "/";
    },
    onError: (error: any) => {
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout",
        variant: "destructive",
      });
    },
  });
}

// Job Seeker specific hooks
export function useJobSeekerDashboard() {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ["/api/dashboard/job-seeker"],
    retry: false,
  });

  return {
    dashboardData,
    isLoading,
    error,
  };
}

// Employer specific hooks
export function useEmployerDashboard() {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ["/api/dashboard/employer"],
    retry: false,
  });

  return {
    dashboardData,
    isLoading,
    error,
  };
}

// Jobs hooks
export function useJobs(search?: string, location?: string, employmentType?: string) {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (location) params.append("location", location);
  if (employmentType) params.append("employmentType", employmentType);
  
  const queryString = params.toString();
  const url = queryString ? `/api/jobs?${queryString}` : "/api/jobs";

  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ["/api/jobs", search, location, employmentType],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch jobs");
      return response.json();
    },
  });

  return {
    jobs: jobs || [],
    isLoading,
    error,
  };
}

export function useSavedJobs() {
  const { data: savedJobs, isLoading, error } = useQuery({
    queryKey: ["/api/saved-jobs"],
    retry: false,
  });

  return {
    savedJobs: savedJobs || [],
    isLoading,
    error,
  };
}

export function useJobApplications() {
  const { data: applications, isLoading, error } = useQuery({
    queryKey: ["/api/applications/job-seeker"],
    retry: false,
  });

  return {
    applications: applications || [],
    isLoading,
    error,
  };
}