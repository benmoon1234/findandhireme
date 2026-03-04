import { DashboardLayout } from "./DashboardLayout";
import { Users, Briefcase, Eye, Plus } from "lucide-react";
import { Link } from "wouter";

export default function EmployerDashboard() {
  return (
    <DashboardLayout role="EMPLOYER">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Employer Overview</h1>
          <p className="text-muted-foreground mt-1">Manage your job listings and applicants.</p>
        </div>
        <Link href="/employer/post-job" className="bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20">
          <Plus className="w-5 h-5"/> Post New Job
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Briefcase className="w-7 h-7"/></div>
          <div>
            <div className="text-3xl font-bold text-foreground">3</div>
            <div className="text-sm font-medium text-muted-foreground">Active Listings</div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><Users className="w-7 h-7"/></div>
          <div>
            <div className="text-3xl font-bold text-foreground">42</div>
            <div className="text-sm font-medium text-muted-foreground">Total Applicants</div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><Eye className="w-7 h-7"/></div>
          <div>
            <div className="text-3xl font-bold text-foreground">1.2k</div>
            <div className="text-sm font-medium text-muted-foreground">Profile Views</div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex justify-between items-center">
          <h2 className="font-bold text-lg">Active Jobs</h2>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Job Title</th>
                <th className="px-6 py-4 font-medium">Applicants</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-5 font-medium">Senior React Developer <br/><span className="text-muted-foreground text-xs font-normal">Remote</span></td>
                <td className="px-6 py-5"><span className="px-2.5 py-1 bg-muted rounded-md font-semibold">14 New</span></td>
                <td className="px-6 py-5"><span className="flex items-center gap-1.5 text-green-600 font-medium"><div className="w-2 h-2 rounded-full bg-green-500"></div> Active</span></td>
                <td className="px-6 py-5 text-right">
                  <button className="text-primary font-medium hover:underline">View Applicants</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
