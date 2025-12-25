import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowRight, Sparkles, TrendingUp, Award, Lightbulb, Zap, Target, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="gradient-bg min-h-screen relative overflow-hidden">
      {/* Floating orbs for visual interest */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl w-full">
          {/* Hero Section */}
          <div className="text-center space-y-6 sm:space-y-8 lg:space-y-10 mb-16 sm:mb-20 lg:mb-24 animate-in fade-in-50 duration-700">
            {/* Badge */}
            {/* <div className="inline-flex items-center gap-2 glass-card px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              // {/* <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary animate-pulse" />
              // <span className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              //   AI-Powered Skill Development Platform
              // </span> */}
            

            {/* Main Heading */}
            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-foreground tracking-tight leading-[1.1]">
                <span className="block">Aivalytics</span>
                <span className="block mt-2 sm:mt-3 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent animate-gradient">
                  Skill Builder
                </span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium px-4 sm:px-0">
                Master aptitude tests with <span className="text-primary font-semibold">AI-driven analytics</span> and personalized feedback. 
                Prepare for top companies like <span className="font-semibold">TCS, Infosys, Wipro</span> and more.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center items-center pt-4 sm:pt-6 w-full sm:w-auto px-4 sm:px-0">
              <Link 
                href="/login" 
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "pointer-events-auto w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-10 rounded-2xl font-semibold text-base sm:text-lg shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105 group bg-gradient-to-r from-primary to-primary/90"
                )}
              >
                <span className="flex items-center gap-2.5">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </Link>
              <Link 
                href="/signup" 
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "pointer-events-auto w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-10 glass-card border-2 border-primary/30 hover:border-primary/60 hover:bg-primary/5 rounded-2xl font-semibold text-base sm:text-lg transition-all duration-300 hover:scale-105"
                )}
              >
                Create Account
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-12 pt-8 sm:pt-12">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary">10K+</div>
                <div className="text-sm sm:text-base text-muted-foreground mt-1">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary">50+</div>
                <div className="text-sm sm:text-base text-muted-foreground mt-1">Company Tests</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary">95%</div>
                <div className="text-sm sm:text-base text-muted-foreground mt-1">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 px-2 sm:px-0">
            {/* AI Analytics Card */}
            <div className="glass-card p-6 sm:p-8 rounded-2xl sm:rounded-3xl space-y-4 hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-primary/10 hover:border-primary/30">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">AI Analytics</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Get personalized insights and track your progress with advanced AI-powered analytics and detailed performance reports.
              </p>
            </div>

            {/* Company Tests Card */}
            <div className="glass-card p-6 sm:p-8 rounded-2xl sm:rounded-3xl space-y-4 hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-primary/10 hover:border-primary/30">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Award className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">Company Tests</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Practice with real company test patterns from TCS, Infosys, Wipro, and 50+ other top companies.
              </p>
            </div>

            {/* Smart Feedback Card */}
            <div className="glass-card p-6 sm:p-8 rounded-2xl sm:rounded-3xl space-y-4 hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-primary/10 hover:border-primary/30 sm:col-span-2 lg:col-span-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">Smart Feedback</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Receive instant, AI-generated feedback with detailed explanations to improve your performance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
