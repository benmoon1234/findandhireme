import { useState, useRef } from "react";
import { DashboardLayout } from "./DashboardLayout";
import { FileText, Briefcase, Bookmark, CheckCircle2, ExternalLink, Upload, File, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useJobs } from "@/hooks/use-jobs";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import type { Employer, Application } from "@shared/schema";
import { JobCard } from "@/components/jobs/JobCard";

export default function SeekerDashboard() {
  const { user } = useAuth();
  const { data: jobs } = useJobs();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { data: employers } = useQuery<Employer[]>({ queryKey: ["/api/employers"] });
  const { data: applications, isLoading: loadingApps } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
    enabled: !!user,
  });
  const { data: savedJobs } = useQuery<any[]>({
    queryKey: ["/api/saved-jobs"],
    enabled: !!user,
  });
  const { data: profile } = useQuery<any>({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload a PDF or Word document.", variant: "destructive" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 10MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("cv", file);
      const res = await fetch("/api/profile/cv", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Upload failed");
      }
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({ title: "CV uploaded", description: `${file.name} has been uploaded successfully.` });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
            <div data-testid="text-cv-status" className="text-2xl font-bold">{profile?.cvUrl ? "Uploaded" : "None"}</div>
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

          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-visible">
            <div className="px-6 py-5 border-b border-border flex justify-between items-center">
              <h2 className="font-bold text-lg">Saved Jobs</h2>
              <span className="text-xs text-muted-foreground">{savedJobs?.length || 0} saved</span>
            </div>
            <div className="p-6">
              {savedJobs && savedJobs.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {savedJobs.map(saved => {
                    const savedJob = jobMap.get(saved.jobId);
                    if (!savedJob) return null;
                    const savedEmployer = savedJob.employerId ? employerMap.get(savedJob.employerId) : undefined;
                    return (
                      <JobCard
                        key={saved.id}
                        job={savedJob}
                        employerName={savedEmployer?.companyName}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Bookmark className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                  <h3 className="font-bold">No saved jobs</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">Bookmark jobs you're interested in to find them here later.</p>
                  <Link href="/jobs" data-testid="link-browse-saved" className="text-primary font-semibold hover:underline">
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
            <h2 className="font-bold text-lg mb-4">My CV</h2>
            {profile?.cvUrl ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <File className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="overflow-hidden flex-1">
                    <p data-testid="text-cv-filename" className="text-sm font-medium truncate">{profile.cvFileName || "CV Document"}</p>
                    <p className="text-xs text-muted-foreground">Uploaded</p>
                  </div>
                  <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer" data-testid="link-view-cv" className="text-primary text-xs font-semibold hover:underline flex-shrink-0">
                    View
                  </a>
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCvUpload}
                    className="hidden"
                    data-testid="input-cv-replace"
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    data-testid="button-replace-cv"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? "Uploading..." : "Replace CV"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center p-4">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Upload your CV to auto-attach it when applying to jobs.</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCvUpload}
                  className="hidden"
                  data-testid="input-cv-upload"
                />
                <Button
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  data-testid="button-upload-cv"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? "Uploading..." : "Upload CV"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
