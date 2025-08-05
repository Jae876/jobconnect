import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/ui/navigation";
import { Link } from "wouter";
import { Search, Users, TrendingUp, Briefcase, CheckCircle, ArrowRight, Star } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Find Your Dream
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Career Today
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12">
              Connect with top employers and talented professionals. Whether you're hiring or job hunting, 
              we make meaningful career connections happen.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link href="/registration?role=job-seeker">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Find Jobs Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/registration?role=employer">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <Briefcase className="w-5 h-5 mr-2" />
                  Post Jobs
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
                <div className="text-gray-600">Active Job Seekers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">500+</div>
                <div className="text-gray-600">Companies Hiring</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
                <div className="text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Choose JobConnect?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform is designed to make job searching and hiring as smooth and effective as possible.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-xl transition-shadow duration-300 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <Search className="text-white w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Matching</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Our advanced algorithms connect the right talent with the right opportunities based on skills and preferences.
                </p>
                <div className="mt-6 flex items-center justify-center text-blue-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-semibold">AI-Powered</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-xl transition-shadow duration-300 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <Users className="text-white w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Quality Network</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Connect with verified professionals and top-tier companies committed to excellence and growth.
                </p>
                <div className="mt-6 flex items-center justify-center text-green-600">
                  <Star className="w-5 h-5 mr-2" />
                  <span className="font-semibold">Verified Users</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-xl transition-shadow duration-300 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <TrendingUp className="text-white w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Career Growth</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Access resources, insights, and opportunities that accelerate your professional development.
                </p>
                <div className="mt-6 flex items-center justify-center text-purple-600">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  <span className="font-semibold">Growth Focused</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to your next opportunity</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* For Job Seekers */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">For Job Seekers</h3>
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">1</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Create Your Profile</h4>
                    <p className="text-gray-600">Share your skills, experience, and career goals to get personalized job matches.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">2</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Browse & Apply</h4>
                    <p className="text-gray-600">Discover opportunities that match your criteria and apply with one click.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">3</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Get Hired</h4>
                    <p className="text-gray-600">Connect with employers and land your dream job with our seamless process.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* For Employers */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">For Employers</h3>
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">1</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Post Your Job</h4>
                    <p className="text-gray-600">Create detailed job listings that attract the right candidates for your team.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">2</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Review Applications</h4>
                    <p className="text-gray-600">Efficiently manage and review applications from qualified candidates.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">3</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Hire Top Talent</h4>
                    <p className="text-gray-600">Find and hire the perfect candidates to grow your business successfully.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-12 text-blue-100">
            Join thousands of professionals who have found success with JobConnect
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/registration?role=job-seeker">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Job Search
              </Button>
            </Link>
            <Link href="/registration?role=employer">
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Hiring
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
