import { apiRequest } from "./queryClient";
import type { 
  User, 
  JobSeekerWithUser, 
  EmployerWithUser,
  JobSeekerRegistration,
  EmployerRegistration,
  LoginForm,
} from "@shared/schema";

export interface AuthUser {
  user: User;
  profile?: JobSeekerWithUser | EmployerWithUser;
}

export interface AuthResponse {
  success: boolean;
  role: "job_seeker" | "employer";
}

export const authApi = {
  register: async (data: JobSeekerRegistration | EmployerRegistration, role: "job-seeker" | "employer"): Promise<AuthResponse> => {
    console.log("🔥 authApi.register called with:", { data, role });
    const response = await apiRequest("POST", `/api/auth/register/${role}`, data);
    const result = await response.json();
    console.log("🔥 authApi.register response:", result);
    return result;
  },

  login: async (credentials: LoginForm): Promise<AuthResponse> => {
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    return response.json();
  },

  logout: async (): Promise<{ success: boolean }> => {
    const response = await apiRequest("POST", "/api/auth/logout");
    return response.json();
  },

  getCurrentUser: async (): Promise<AuthUser | null> => {
    try {
      const response = await apiRequest("GET", "/api/auth/user");
      return response.json();
    } catch (error) {
      return null;
    }
  },
};
