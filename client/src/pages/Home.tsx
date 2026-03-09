import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Search, MapPin, Target, FileText, Send, Building } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JobCard } from "@/components/jobs/JobCard";
import { useJobs } from "@/hooks/use-jobs";
import { useQuery } from "@tanstack/react-query";
import { usePageMeta } from "@/hooks/use-page-meta";
import type { Employer } from "@shared/schema";

export default function Home() {
  usePageMeta("Job Search & Recruitment Platform", "Find and hire top talent or discover your next career opportunity across US, UK, Nigeria, and remote global positions.");
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const { data: jobs, isLoading } = useJobs();
  const { data: employers } = useQuery<Employer[]>({ queryKey: ["/api/employers"] });

  const employerMap = useMemo(() => {
    const map: Record<number, string> = {};
    employers?.forEach(e => { map[e.id] = e.companyName; });
    return map;
  }, [employers]);

  const featuredJobs = jobs?.filter(j => j.isFeatured).slice(0, 6) || [];
  const recentJobs = jobs?.slice(0, 4) || [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />
        
        <div className="text-center max-w-4xl mx-auto animate-slide-up">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-foreground leading-[1.1]">
            Find Your Next Opportunity, <br className="hidden md:block" />
            <span className="text-gradient">Anywhere in the World</span>
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
            Search thousands of verified jobs across the US, UK, Nigeria, and fully remote roles matching your skills.
          </p>

          {/* Search Box */}
          <div className="mt-10 bg-card p-3 rounded-2xl md:rounded-full shadow-2xl shadow-primary/5 border border-border/80 flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex items-center px-4 bg-muted/50 rounded-xl md:rounded-full md:bg-transparent">
              <Search className="w-5 h-5 text-muted-foreground mr-3" />
              <input 
                type="text" 
                placeholder="Job title, keywords, or company" 
                className="w-full bg-transparent border-none focus:outline-none py-3 md:py-4 text-foreground placeholder:text-muted-foreground"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
            </div>
            <div className="hidden md:block w-px bg-border my-2"></div>
            <div className="flex-1 flex items-center px-4 bg-muted/50 rounded-xl md:rounded-full md:bg-transparent">
              <MapPin className="w-5 h-5 text-muted-foreground mr-3" />
              <input 
                type="text" 
                placeholder="City, state, or postcode" 
                className="w-full bg-transparent border-none focus:outline-none py-3 md:py-4 text-foreground placeholder:text-muted-foreground"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>
            <Link 
              href={`/jobs?q=${keyword}&l=${location}`}
              className="bg-primary text-primary-foreground font-semibold px-8 py-4 rounded-xl md:rounded-full hover:bg-primary/90 transition-colors text-center shadow-lg shadow-primary/25"
            >
              Search Jobs
            </Link>
          </div>

          {/* Country Tabs */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <span className="text-sm text-muted-foreground py-2 mr-2">Popular:</span>
            {['🇺🇸 US Jobs', '🇬🇧 UK Jobs', '🇳🇬 Nigeria Jobs', '🌍 Global & Remote'].map((tab) => (
              <Link key={tab} href="/jobs" className="px-4 py-2 rounded-full border border-border bg-card text-sm font-medium hover:border-primary/50 hover:text-primary transition-all">
                {tab}
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Ticker */}
        <div className="mt-20 border-y border-border py-8 flex flex-wrap justify-around gap-8 text-center animate-fade-in stagger-2">
          <div>
            <div className="text-3xl font-display font-bold text-foreground">120k+</div>
            <div className="text-sm text-muted-foreground mt-1">Active Jobs</div>
          </div>
          <div>
            <div className="text-3xl font-display font-bold text-foreground">8,500+</div>
            <div className="text-sm text-muted-foreground mt-1">Employers</div>
          </div>
          <div>
            <div className="text-3xl font-display font-bold text-foreground">45</div>
            <div className="text-sm text-muted-foreground mt-1">Countries Covered</div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-display font-bold">Featured Opportunities</h2>
              <p className="text-muted-foreground mt-2">Premium listings from top employers</p>
            </div>
            <Link href="/jobs" className="hidden md:block text-primary font-semibold hover:underline">
              View all jobs &rarr;
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="h-48 bg-card rounded-2xl animate-pulse border border-border"></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map(job => (
                <JobCard key={job.id} job={job} featured={true} employerName={job.employerId ? employerMap[job.employerId] : undefined} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-display font-bold mb-16">How Find & Hire Me Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 shadow-inner">
                <FileText className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Create Profile</h3>
              <p className="text-muted-foreground">Upload your CV and let our AI instantly parse your skills and experience to build your profile.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 shadow-inner">
                <Target className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Get Matched</h3>
              <p className="text-muted-foreground">Our matching engine finds the perfect roles for you across local and global remote markets.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-6 shadow-inner">
                <Send className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Apply & Connect</h3>
              <p className="text-muted-foreground">Apply with one click. Track your applications and connect directly with hiring managers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-br from-foreground to-foreground/90 rounded-3xl p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-primary/20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-accent/20 blur-3xl"></div>
          
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6 relative z-10">Ready to Get Hired?</h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10 relative z-10">
            Join thousands of professionals finding their dream jobs, or discover the perfect candidate for your growing team.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <Link href="/jobs" className="px-8 py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25">
              Search Jobs Now
            </Link>
            <Link href="/employer/post-job" className="px-8 py-4 rounded-xl bg-white text-foreground font-bold hover:bg-gray-50 transition-all shadow-lg">
              Post a Job for Free
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
