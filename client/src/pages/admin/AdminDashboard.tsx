import { DashboardLayout } from "../dashboard/DashboardLayout";
import { useJobs } from "@/hooks/use-jobs";
import { useQuery } from "@tanstack/react-query";
import { Users, Briefcase, TrendingUp, DollarSign, CheckCircle2, XCircle, Eye } from "lucide-react";
import type { Employer } from "@shared/schema";

export default function AdminDashboard() {
  const { data: jobs } = useJobs();
  const { data: employers } = useQuery<Employer[]>({
    queryKey: ["/api/employers"],
    queryFn: async () => {
      const res = await fetch("/api/employers");
      return res.json();
    },
  });

  const activeJobs = jobs?.filter(j => j.status === "ACTIVE").length || 0;
  const totalJobs = jobs?.length || 0;
  const totalEmployers = employers?.length || 0;
  const verifiedEmployers = employers?.filter(e => e.verified).length || 0;

  return (
    <DashboardLayout role="ADMIN">
      <h1 data-testid="text-admin-title" className="text-3xl font-display font-bold mb-2">Admin Overview</h1>
      <p className="text-muted-foreground mb-8">Platform statistics and management tools.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Users className="w-6 h-6" /></div>
          <div>
            <div className="text-2xl font-bold">156</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><Briefcase className="w-6 h-6" /></div>
          <div>
            <div className="text-2xl font-bold">{activeJobs}</div>
            <div className="text-sm text-muted-foreground">Active Jobs</div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <div className="text-2xl font-bold">342</div>
            <div className="text-sm text-muted-foreground">Applications Today</div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center"><DollarSign className="w-6 h-6" /></div>
          <div>
            <div className="text-2xl font-bold">$4.2k</div>
            <div className="text-sm text-muted-foreground">Revenue MTD</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-border">
            <h2 className="font-bold text-lg">Employer Verification Queue</h2>
          </div>
          <div className="divide-y divide-border">
            {employers?.filter(e => !e.verified).length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                All employers verified
              </div>
            ) : (
              employers?.filter(e => !e.verified).map(emp => (
                <div key={emp.id} className="px-6 py-4 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{emp.companyName}</div>
                    <div className="text-sm text-muted-foreground">{emp.industry} - {emp.location}</div>
                  </div>
                  <div className="flex gap-2">
                    <button data-testid={`button-approve-${emp.id}`} className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors">
                      Approve
                    </button>
                    <button data-testid={`button-reject-${emp.id}`} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors">
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-border">
            <h2 className="font-bold text-lg">Recent Job Listings</h2>
          </div>
          <div className="divide-y divide-border">
            {jobs?.slice(0, 5).map(job => (
              <div key={job.id} className="px-6 py-4 flex justify-between items-center">
                <div>
                  <div className="font-medium text-sm">{job.title}</div>
                  <div className="text-xs text-muted-foreground">{job.location} - {job.country}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="w-3 h-3" /> {job.viewCount}
                  </span>
                  <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                    job.status === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"
                  }`}>
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex justify-between items-center">
          <h2 className="font-bold text-lg">All Jobs ({totalJobs})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Location</th>
                <th className="px-6 py-3 font-medium">Country</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Featured</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {jobs?.map(job => (
                <tr key={job.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium">{job.title}</td>
                  <td className="px-6 py-4 text-muted-foreground">{job.location}</td>
                  <td className="px-6 py-4 text-muted-foreground">{job.country}</td>
                  <td className="px-6 py-4 text-muted-foreground">{job.employmentType?.replace("_", " ")}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                      job.status === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-700"
                    }`}>{job.status}</span>
                  </td>
                  <td className="px-6 py-4">{job.isFeatured ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <span className="text-muted-foreground">-</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
