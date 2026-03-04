import { DashboardLayout } from "./DashboardLayout";
import { FileText, Briefcase, Bookmark, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function SeekerDashboard() {
  const { user } = useAuth();
  
  return (
    <DashboardLayout role="JOB_SEEKER">
      <h1 className="text-3xl font-display font-bold mb-2">Welcome back, {user?.name?.split(' ')[0] || 'Seeker'}</h1>
      <p className="text-muted-foreground mb-8">Here is what's happening with your job search today.</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Briefcase className="w-6 h-6"/></div>
          <div>
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-muted-foreground">Applications</div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><Bookmark className="w-6 h-6"/></div>
          <div>
            <div className="text-2xl font-bold">5</div>
            <div className="text-sm text-muted-foreground">Saved Jobs</div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><CheckCircle2 className="w-6 h-6"/></div>
          <div>
            <div className="text-2xl font-bold">85%</div>
            <div className="text-sm text-muted-foreground">Profile Match</div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center"><FileText className="w-6 h-6"/></div>
          <div>
            <div className="text-2xl font-bold">Parsed</div>
            <div className="text-sm text-muted-foreground">CV Status</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-border flex justify-between items-center">
              <h2 className="font-bold text-lg">Recent Applications</h2>
              <a href="#" className="text-sm text-primary font-medium hover:underline">View All</a>
            </div>
            <div className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 font-medium">Job Title</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">Frontend Engineer <br/><span className="text-muted-foreground font-normal">Acme Corp</span></td>
                    <td className="px-6 py-4"><span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">Reviewing</span></td>
                    <td className="px-6 py-4 text-muted-foreground">Oct 24, 2023</td>
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">Product Designer <br/><span className="text-muted-foreground font-normal">Global Tech</span></td>
                    <td className="px-6 py-4"><span className="px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs font-semibold">Interview</span></td>
                    <td className="px-6 py-4 text-muted-foreground">Oct 20, 2023</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Side Column */}
        <div className="space-y-8">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <h2 className="font-bold text-lg mb-4">Complete Your Profile</h2>
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div className="bg-primary h-2 rounded-full w-[85%]"></div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">You're almost there! Add your portfolio link to reach 100%.</p>
            <button className="w-full py-2.5 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary/5 transition-colors">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
