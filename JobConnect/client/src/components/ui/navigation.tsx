import { Link, useLocation } from "wouter";
import { Briefcase, LogOut, User } from "lucide-react";
import { Button } from "./button";
import { authApi } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface NavigationProps {
  user?: {
    firstName: string;
    lastName: string;
    role: string;
  };
  onLogout?: () => void;
}

export function Navigation({ user, onLogout }: NavigationProps) {
  const [location] = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      if (onLogout) onLogout();
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <Briefcase className="text-brand-blue text-2xl mr-2" />
            <span className="text-xl font-bold text-gray-900">JobConnect</span>
          </Link>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {user.firstName}!
              </span>
              <div className="relative">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/registration">
                <Button>Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
