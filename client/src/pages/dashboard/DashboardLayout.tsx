import { ReactNode, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Briefcase, User, FileText, Bookmark, Bell, LogOut, Settings, BarChart2, Menu, X, Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface LayoutProps {
  children: ReactNode;
  role: 'JOB_SEEKER' | 'EMPLOYER' | 'ADMIN';
}

export function DashboardLayout({ children, role }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifDesktopRef = useRef<HTMLDivElement>(null);
  const notifMobileRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  useEffect(() => {
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
  }, [location]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
      if (
        notifDesktopRef.current && !notifDesktopRef.current.contains(e.target as Node) &&
        notifMobileRef.current && !notifMobileRef.current.contains(e.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    }
    if (mobileMenuOpen || notificationsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [mobileMenuOpen, notificationsOpen]);

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    refetchInterval: 30000,
    enabled: !!user,
  });

  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
    enabled: notificationsOpen && !!user,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", "/api/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const unreadCount = unreadData?.count || 0;

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

  const renderNotificationBell = (ref: React.RefObject<HTMLDivElement | null>) => (
    <div className="relative" ref={ref}>
      <button
        data-testid="button-notifications"
        onClick={() => setNotificationsOpen(!notificationsOpen)}
        className="relative p-2 rounded-xl hover:bg-muted text-foreground transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center" data-testid="badge-unread-count">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {notificationsOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden animate-slide-up" data-testid="panel-notifications">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                data-testid="button-mark-all-read"
                onClick={() => markAllReadMutation.mutate()}
                className="text-xs text-primary hover:underline font-medium"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="overflow-y-auto max-h-72">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground" data-testid="text-no-notifications">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No notifications yet
              </div>
            ) : (
              notifications.slice(0, 20).map((notif: any) => (
                <div
                  key={notif.id}
                  className={`px-4 py-3 border-b border-border last:border-b-0 flex items-start gap-3 hover:bg-muted/30 transition-colors ${!notif.isRead ? "bg-primary/5" : ""}`}
                  data-testid={`notification-item-${notif.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notif.isRead ? "font-semibold" : "font-medium text-muted-foreground"}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ""}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <button
                      data-testid={`button-mark-read-${notif.id}`}
                      onClick={() => markReadMutation.mutate(notif.id)}
                      className="p-1 rounded hover:bg-muted text-primary flex-shrink-0"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
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
            <div className="overflow-hidden flex-1">
              <div className="font-bold text-sm truncate">{user?.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            </div>
            <div className="flex items-center gap-1">
              {renderNotificationBell(notifDesktopRef)}
              <ThemeToggle />
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-destructive hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <div className="md:hidden bg-card border-b border-border p-4 flex justify-between items-center relative" ref={menuRef}>
          <div className="flex items-center gap-3">
            <button
              data-testid="button-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl hover:bg-muted text-foreground transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/" className="flex items-center gap-2 text-primary">
              <Briefcase className="w-6 h-6" />
              <span className="font-display font-bold text-foreground">Find & Hire <span className="text-primary">Me</span></span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {renderNotificationBell(notifMobileRef)}
            <ThemeToggle />
            <button onClick={handleLogout} className="p-2 rounded-xl text-muted-foreground hover:text-destructive transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-card border-b border-border shadow-xl z-50 animate-slide-up">
              <div className="p-3 border-b border-border">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-bold text-sm truncate">{user?.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                  </div>
                </div>
              </div>
              <nav className="p-3 space-y-1">
                {links.map(link => {
                  const active = location === link.path;
                  return (
                    <Link
                      key={link.path}
                      href={link.path}
                      data-testid={`mobile-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                    >
                      <link.icon className="w-5 h-5" />
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
        
        <div className="p-4 sm:p-8 max-w-6xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
