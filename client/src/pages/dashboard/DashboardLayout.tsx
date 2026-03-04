import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Briefcase, User, FileText, Bookmark, Bell, LogOut, Settings, BarChart2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface LayoutProps {
  children: ReactNode;
  role: 'JOB_SEEKER' | 'EMPLOYER' | 'ADMIN';
}

export function DashboardLayout({ children, role }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const getLinks = () => {
    if (role === 'EMPLOYER') return [
      { name: 'Dashboard', icon: BarChart2, path: '/employer/dashboard' },
      { name: 'My Jobs', icon: Briefcase, path: '/employer/jobs' },
      { name: 'Post a Job', icon: FileText, path: '/employer/post-job' },
      { name: 'Settings', icon: Settings, path: '/employer/settings' },
    ];
    if (role === 'ADMIN') return [
      { name: 'Overview', icon: BarChart2, path: '/admin' },
      { name: 'Users', icon: User, path: '/admin/users' },
      { name: 'Jobs', icon: Briefcase, path: '/admin/jobs' },
      { name: 'System Logs', icon: FileText, path: '/admin/audit-logs' },
    ];
    return [
      { name: 'Overview', icon: BarChart2, path: '/dashboard' },
      { name: 'My Profile', icon: User, path: '/dashboard/profile' },
      { name: 'My CV', icon: FileText, path: '/dashboard/cv' },
      { name: 'Applications', icon: Briefcase, path: '/dashboard/applications' },
      { name: 'Saved Jobs', icon: Bookmark, path: '/dashboard/saved-jobs' },
      { name: 'Alerts', icon: Bell, path: '/dashboard/alerts' },
    ];
  };

  const links = getLinks();

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-border md:min-h-screen flex-shrink-0 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2 text-primary cursor-pointer">
            <Briefcase className="w-8 h-8" />
            <span className="font-display font-bold text-xl text-foreground truncate">Find & Hire <span className="text-primary">Me</span></span>
          </Link>
        </div>
        
        <div className="p-4 flex-1">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 px-3">Menu</div>
          <nav className="space-y-1">
            {links.map(link => {
              const active = location === link.path;
              return (
                <Link key={link.path} href={link.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${active ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                  <link.icon className="w-5 h-5" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-sm truncate">{user?.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-destructive hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {/* Mobile Header (minimal) */}
        <div className="md:hidden bg-card border-b border-border p-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-primary">
            <Briefcase className="w-6 h-6" />
          </Link>
          <button onClick={handleLogout} className="text-muted-foreground"><LogOut className="w-5 h-5"/></button>
        </div>
        
        <div className="p-4 sm:p-8 max-w-6xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
