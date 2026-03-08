import { Link, useLocation } from "wouter";
import { Briefcase, User, LogOut, Menu, X, Plus } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
              <Briefcase className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">
              Find & Hire <span className="text-primary">Me</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/jobs" data-testid="link-find-jobs" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Find Jobs</Link>
            <Link href="/employers" data-testid="link-employers" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Employers</Link>
            <Link href="/resources" data-testid="link-resources" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Resources</Link>
            
            <div className="flex items-center space-x-4 ml-4 border-l border-border pl-6">
              <ThemeToggle />
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link 
                    href={user.role === 'EMPLOYER' ? '/employer/dashboard' : '/dashboard'} 
                    className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User className="w-4 h-4" />
                    </div>
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/auth" data-testid="link-sign-in" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">Sign In</Link>
                  <Link href="/employer/post-job" data-testid="link-post-job" className="px-5 py-2.5 rounded-full font-semibold bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Post a Job
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border p-4 absolute top-20 left-0 right-0 shadow-xl animate-slide-up">
          <div className="flex flex-col space-y-4">
            <Link href="/jobs" className="px-4 py-3 rounded-lg hover:bg-muted font-medium">Find Jobs</Link>
            <Link href="/employers" className="px-4 py-3 rounded-lg hover:bg-muted font-medium">For Employers</Link>
            <Link href="/resources" className="px-4 py-3 rounded-lg hover:bg-muted font-medium">Career Resources</Link>
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <hr className="border-border" />
            {user ? (
               <>
                <Link href={user.role === 'EMPLOYER' ? '/employer/dashboard' : '/dashboard'} className="px-4 py-3 rounded-lg hover:bg-muted font-medium flex items-center gap-2">
                  <User className="w-5 h-5" /> Dashboard
                </Link>
                <button onClick={handleLogout} className="px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-destructive font-medium text-left flex items-center gap-2">
                  <LogOut className="w-5 h-5" /> Sign Out
                </button>
               </>
            ) : (
              <>
                <Link href="/auth" className="px-4 py-3 rounded-lg hover:bg-muted font-medium">Sign In</Link>
                <Link href="/employer/post-job" className="px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-center">Post a Job</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
