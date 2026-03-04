import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";

// Pages
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Auth from "./pages/Auth";
import SeekerDashboard from "./pages/dashboard/SeekerDashboard";
import EmployerDashboard from "./pages/dashboard/EmployerDashboard";
import NotFound from "./pages/not-found";

// Protected Route Wrapper
function ProtectedRoute({ component: Component, allowedRoles }: { component: any, allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-primary font-bold">Loading...</div>;

  if (!user) {
    setLocation("/auth");
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    setLocation("/");
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/jobs/:id" component={JobDetail} />
      <Route path="/auth" component={Auth} />
      
      {/* Protected Seeker Routes */}
      <Route path="/dashboard" render={() => <ProtectedRoute component={SeekerDashboard} allowedRoles={['JOB_SEEKER']} />} />
      <Route path="/dashboard/:tab" render={() => <ProtectedRoute component={SeekerDashboard} allowedRoles={['JOB_SEEKER']} />} />

      {/* Protected Employer Routes */}
      <Route path="/employer/dashboard" render={() => <ProtectedRoute component={EmployerDashboard} allowedRoles={['EMPLOYER']} />} />
      <Route path="/employer/post-job" render={() => <ProtectedRoute component={EmployerDashboard} allowedRoles={['EMPLOYER']} />} />
      <Route path="/employer/jobs" render={() => <ProtectedRoute component={EmployerDashboard} allowedRoles={['EMPLOYER']} />} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
