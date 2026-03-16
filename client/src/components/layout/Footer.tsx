import { Link } from "wouter";
import { Briefcase, Twitter, Linkedin, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Briefcase className="w-8 h-8" />
              <span className="font-display font-bold text-xl text-foreground">Find & Hire Me</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Connecting top talent with extraordinary opportunities around the globe.
              Your next career move starts here.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Job Seekers</h4>
            <ul className="space-y-3">
              <li><Link href="/jobs" className="text-sm text-muted-foreground hover:text-primary transition-colors">Search Jobs</Link></li>
              <li><Link href="/dashboard/cv" className="text-sm text-muted-foreground hover:text-primary transition-colors">Upload CV</Link></li>
              <li><Link href="/dashboard/alerts" className="text-sm text-muted-foreground hover:text-primary transition-colors">Job Alerts</Link></li>
              <li><Link href="/resources" className="text-sm text-muted-foreground hover:text-primary transition-colors">Career Advice</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Employers</h4>
            <ul className="space-y-3">
              <li><Link href="/employer/post-job" className="text-sm text-muted-foreground hover:text-primary transition-colors">Post a Job</Link></li>
              <li><Link href="/employers" className="text-sm text-muted-foreground hover:text-primary transition-colors">Browse Candidates</Link></li>
              <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/employer/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">Employer Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Locations</h4>
            <ul className="space-y-3">
              <li><Link href="/jobs/us" className="text-sm text-muted-foreground hover:text-primary transition-colors">🇺🇸 United States</Link></li>
              <li><Link href="/jobs/uk" className="text-sm text-muted-foreground hover:text-primary transition-colors">🇬🇧 United Kingdom</Link></li>
              <li><Link href="/jobs/nigeria" className="text-sm text-muted-foreground hover:text-primary transition-colors">🇳🇬 Nigeria</Link></li>
              <li><Link href="/jobs?remote=true" className="text-sm text-muted-foreground hover:text-primary transition-colors">🌍 Remote & Global</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Find & Hire Me. All rights reserved.</p>
          <div className="flex space-x-6 text-sm">
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
