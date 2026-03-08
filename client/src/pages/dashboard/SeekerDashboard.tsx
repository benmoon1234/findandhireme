import { DashboardLayout } from "./DashboardLayout";
import { FileText, Briefcase, Bookmark, CheckCircle2, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useJobs } from "@/hooks/use-jobs";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import type { Employer, Application } from "@shared/schema";

export default function SeekerDashboard() {
  const { user } = useAuth();
  const { data: jobs } = useJobs();
  const { data: employers } = useQuery<Employer[]>({ queryKey: ["/api/employers"] });
  const { data: applications, isLoading: loadingApps } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
    enabled: !!user,
  });
  const { data: savedJobs } = useQuery<any[]>({
    queryKey: ["/api/saved-jobs"],
    enabled: !!user,
  });

  const jobMap = new Map(jobs?.map(j => [j.id, j]) || []);
  const employerMap = new Map(employers?.map(e => [e.id, e]) || []);

  const statusColors: Record<string, string> = {
    NEW: "bg-blue-50 text-blue-700",
    REVIEWING: "bg-yellow-50 text-yellow-700",
    INTERVIEW: "bg-green-50 text-green-700",
    REJECTED: "bg-red-50 text-red-700",
    OFFERED: "bg-purple-50 text-purple-700",
  };

  return (
    <DashboardLayout role="JOB_SEEKER">
      <h1 data-testid="text-welcome" className="text-3xl font-display font-bold mb-2">Welcome back, {user?.name?.split(' ')[0] || 'Seeker'}</h1>
      <p className="text-muted-foreground mb-8">Here's what's happening with your job search.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Briefcase className="w-6 h-6" /></div>
          <div>
            <div data-testid="text-app-count" className="text-2xl font-bold">{applications?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Applications</div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><Bookmark className="w-6 h-6" /></div>
          <div>
            <div className="text-2xl font-bold">{savedJobs?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Saved Jobs</div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><CheckCircle2 className="w-6 h-6" /></div>
          <div>
            <div className="text-2xl font-bold">{jobs?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Available Jobs</div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center"><FileText className="w-6 h-6" /></div>
          <div>
            <div className="text-2xl font-bold">—</div>
            <div className="text-sm text-muted-foreground">CV Status</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-border flex justify-between items-center">
              <h2 className="font-bold text-lg">My Applications</h2>
              <span className="text-xs text-muted-foreground">{applications?.length || 0} total</span>
            </div>
            <div className="p-0">
              {loadingApps ? (
                <div className="p-8 text-center text-muted-foreground">Loading applications...</div>
              ) : applications && applications.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-6 py-3 font-medium">Job</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Applied</th>
                      <th className="px-6 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {applications.map(app => {
                      const appJob = jobMap.get(app.jobId);
                      const appEmployer = appJob?.employerId ? employerMap.get(appJob.employerId) : undefined;
                      return (
                        <tr key={app.id} data-testid={`row-application-${app.id}`} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium">{appJob?.title || `Job #${app.jobId}`}</div>
                            <div className="text-muted-foreground text-xs">{appEmployer?.companyName || "Company"}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-md text-xs font-semibold ${statusColors[app.status || "NEW"] || "bg-gray-50 text-gray-700"}`}>
                              {app.status || "NEW"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {app.appliedAt ? formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true }) : "Recently"}
                          </td>
                          <td className="px-6 py-4">
                            <Link href={`/jobs/${app.jobId}`} className="text-primary text-xs font-semibold hover:underline flex items-center gap-1">
                              View <ExternalLink className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center">
                  <Briefcase className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                  <h3 className="font-bold">No applications yet</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">Start applying to jobs to track your progress here.</p>
                  <Link href="/jobs" data-testid="link-browse-jobs" className="text-primary font-semibold hover:underline">
                    Browse Jobs
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <h2 className="font-bold text-lg mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/jobs" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-sm font-medium">
                <Briefcase className="w-5 h-5 text-primary" /> Browse Jobs
              </Link>
              <Link href="/employers" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-sm font-medium">
                <CheckCircle2 className="w-5 h-5 text-primary" /> View Employers
              </Link>
              <Link href="/resources" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-sm font-medium">
                <FileText className="w-5 h-5 text-primary" /> Career Resources
              </Link>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <h2 className="font-bold text-lg mb-4">Complete Your Profile</h2>
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div className="bg-primary h-2 rounded-full w-[40%]" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">Upload your CV and add skills to improve your match score.</p>
            <button className="w-full py-2.5 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary/5 transition-colors">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
