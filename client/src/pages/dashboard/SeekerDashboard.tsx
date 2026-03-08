import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "./DashboardLayout";
import { FileText, Briefcase, Bookmark, CheckCircle2, ExternalLink, Upload, File, Loader2, Bell, User, Save, X, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useJobs } from "@/hooks/use-jobs";
import { Link, useRoute } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import type { Employer, Application } from "@shared/schema";
import { JobCard } from "@/components/jobs/JobCard";

function OverviewTab({ user, jobs, employers, applications, savedJobs, profile, loadingApps, fileInputRef, uploading, handleCvUpload }: any) {
  const jobMap = new Map(jobs?.map((j: any) => [j.id, j]) || []);
  const employerMap = new Map(employers?.map((e: any) => [e.id, e]) || []);

  const statusColors: Record<string, string> = {
    NEW: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
    REVIEWING: "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300",
    INTERVIEW: "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300",
    REJECTED: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300",
    OFFERED: "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300",
  };

  return (
    <>
      <h1 data-testid="text-welcome" className="text-3xl font-display font-bold mb-2">Welcome back, {user?.name?.split(' ')[0] || 'Seeker'}</h1>
      <p className="text-muted-foreground mb-8">Here's what's happening with your job search.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center"><Briefcase className="w-6 h-6" /></div>
          <div>
            <div data-testid="text-app-count" className="text-2xl font-bold">{applications?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Applications</div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center"><Bookmark className="w-6 h-6" /></div>
          <div>
            <div className="text-2xl font-bold">{savedJobs?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Saved Jobs</div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 flex items-center justify-center"><CheckCircle2 className="w-6 h-6" /></div>
          <div>
            <div className="text-2xl font-bold">{jobs?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Available Jobs</div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center"><FileText className="w-6 h-6" /></div>
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
                    {applications.map((app: any) => {
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
                  <Link href="/jobs" data-testid="link-browse-jobs" className="text-primary font-semibold hover:underline">Browse Jobs</Link>
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
                  {savedJobs.map((saved: any) => {
                    const savedJob = jobMap.get(saved.jobId);
                    if (!savedJob) return null;
                    const savedEmployer = savedJob.employerId ? employerMap.get(savedJob.employerId) : undefined;
                    return <JobCard key={saved.id} job={savedJob} employerName={savedEmployer?.companyName} />;
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Bookmark className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                  <h3 className="font-bold">No saved jobs</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">Bookmark jobs you're interested in to find them here later.</p>
                  <Link href="/jobs" data-testid="link-browse-saved" className="text-primary font-semibold hover:underline">Browse Jobs</Link>
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
                  <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer" data-testid="link-view-cv" className="text-primary text-xs font-semibold hover:underline flex-shrink-0">View</a>
                </div>
                <div>
                  <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleCvUpload} className="hidden" data-testid="input-cv-replace" />
                  <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={uploading} data-testid="button-replace-cv">
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
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleCvUpload} className="hidden" data-testid="input-cv-upload" />
                <Button className="w-full" onClick={() => fileInputRef.current?.click()} disabled={uploading} data-testid="button-upload-cv">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? "Uploading..." : "Upload CV"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ProfileTab({ profile }: { profile: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [skills, setSkills] = useState("");
  const [skillTags, setSkillTags] = useState<string[]>([]);
  const [locations, setLocations] = useState("");
  const [locationTags, setLocationTags] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [employment, setEmployment] = useState<string[]>([]);
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");

  useEffect(() => {
    if (profile) {
      setSkillTags(profile.skills || []);
      setLocationTags(profile.preferredLocations || []);
      setCountries(profile.preferredCountries || []);
      setEmployment(profile.preferredEmployment || []);
      setSalaryMin(profile.salaryMin?.toString() || "");
      setSalaryMax(profile.salaryMax?.toString() || "");
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", "/api/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({ title: "Profile saved", description: "Your profile has been updated." });
    },
    onError: (err: Error) => {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    },
  });

  const handleSave = () => {
    saveMutation.mutate({
      skills: skillTags,
      preferredLocations: locationTags,
      preferredCountries: countries,
      preferredEmployment: employment,
      salaryMin: salaryMin ? parseInt(salaryMin) : null,
      salaryMax: salaryMax ? parseInt(salaryMax) : null,
    });
  };

  const addSkill = () => {
    const trimmed = skills.trim();
    if (trimmed && !skillTags.includes(trimmed)) {
      setSkillTags([...skillTags, trimmed]);
      setSkills("");
    }
  };

  const addLocation = () => {
    const trimmed = locations.trim();
    if (trimmed && !locationTags.includes(trimmed)) {
      setLocationTags([...locationTags, trimmed]);
      setLocations("");
    }
  };

  const toggleCountry = (c: string) => {
    setCountries(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const toggleEmployment = (e: string) => {
    setEmployment(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);
  };

  const countryOptions = [
    { value: "US", label: "United States" },
    { value: "UK", label: "United Kingdom" },
    { value: "NG", label: "Nigeria" },
    { value: "GLOBAL", label: "Global / Remote" },
  ];

  const employmentOptions = [
    { value: "FULL_TIME", label: "Full-Time" },
    { value: "PART_TIME", label: "Part-Time" },
    { value: "CONTRACT", label: "Contract" },
    { value: "FREELANCE", label: "Freelance" },
  ];

  return (
    <>
      <h1 className="text-3xl font-display font-bold mb-2">My Profile</h1>
      <p className="text-muted-foreground mb-8">Update your preferences to get better job matches.</p>

      <div className="max-w-2xl space-y-8">
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <h2 className="font-bold text-lg mb-4">Skills</h2>
          <div className="flex gap-2 mb-3">
            <input
              data-testid="input-skill"
              value={skills}
              onChange={e => setSkills(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
              placeholder="Type a skill and press Enter"
              className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
            <Button onClick={addSkill} variant="outline" data-testid="button-add-skill"><Plus className="w-4 h-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skillTags.map((tag, i) => (
              <span key={i} className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium flex items-center gap-1.5">
                {tag}
                <button onClick={() => setSkillTags(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-destructive"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <h2 className="font-bold text-lg mb-4">Preferred Locations</h2>
          <div className="flex gap-2 mb-3">
            <input
              data-testid="input-location"
              value={locations}
              onChange={e => setLocations(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addLocation(); } }}
              placeholder="Type a city and press Enter"
              className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
            <Button onClick={addLocation} variant="outline" data-testid="button-add-location"><Plus className="w-4 h-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {locationTags.map((tag, i) => (
              <span key={i} className="px-3 py-1.5 bg-accent/10 text-accent rounded-lg text-sm font-medium flex items-center gap-1.5">
                {tag}
                <button onClick={() => setLocationTags(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-destructive"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <h2 className="font-bold text-lg mb-4">Preferred Countries</h2>
          <div className="grid grid-cols-2 gap-3">
            {countryOptions.map(opt => (
              <button
                key={opt.value}
                data-testid={`toggle-country-${opt.value}`}
                onClick={() => toggleCountry(opt.value)}
                className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                  countries.includes(opt.value)
                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                    : 'bg-card border-border text-foreground hover:bg-muted'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <h2 className="font-bold text-lg mb-4">Preferred Employment Type</h2>
          <div className="grid grid-cols-2 gap-3">
            {employmentOptions.map(opt => (
              <button
                key={opt.value}
                data-testid={`toggle-employment-${opt.value}`}
                onClick={() => toggleEmployment(opt.value)}
                className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                  employment.includes(opt.value)
                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                    : 'bg-card border-border text-foreground hover:bg-muted'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <h2 className="font-bold text-lg mb-4">Salary Expectations</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Minimum (USD)</label>
              <input
                data-testid="input-salary-min"
                type="number"
                value={salaryMin}
                onChange={e => setSalaryMin(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Maximum (USD)</label>
              <input
                data-testid="input-salary-max"
                type="number"
                value={salaryMax}
                onChange={e => setSalaryMax(e.target.value)}
                placeholder="e.g. 100000"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saveMutation.isPending} className="w-full py-3" data-testid="button-save-profile">
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Profile
        </Button>
      </div>
    </>
  );
}

function AlertsTab({ profile }: { profile: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [frequency, setFrequency] = useState(profile?.alertFrequency || "DAILY");
  const [channels, setChannels] = useState<string[]>(profile?.alertChannels || ["EMAIL"]);

  useEffect(() => {
    if (profile) {
      setFrequency(profile.alertFrequency || "DAILY");
      setChannels(profile.alertChannels || ["EMAIL"]);
    }
  }, [profile]);

  const { data: alerts, isLoading: loadingAlerts } = useQuery<any[]>({
    queryKey: ["/api/alerts"],
  });

  const { data: jobs } = useJobs();
  const jobMap = new Map(jobs?.map(j => [j.id, j]) || []);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", "/api/profile/alerts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({ title: "Alert preferences saved" });
    },
    onError: (err: Error) => {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    },
  });

  const toggleChannel = (ch: string) => {
    setChannels(prev => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]);
  };

  return (
    <>
      <h1 className="text-3xl font-display font-bold mb-2">Job Alerts</h1>
      <p className="text-muted-foreground mb-8">Configure how you receive job notifications.</p>

      <div className="max-w-2xl space-y-8">
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <h2 className="font-bold text-lg mb-4">Alert Frequency</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {["INSTANT", "DAILY", "WEEKLY", "NEVER"].map(f => (
              <button
                key={f}
                data-testid={`toggle-freq-${f}`}
                onClick={() => setFrequency(f)}
                className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                  frequency === f
                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                    : 'bg-card border-border text-foreground hover:bg-muted'
                }`}
              >
                {f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <h2 className="font-bold text-lg mb-4">Notification Channels</h2>
          <div className="space-y-3">
            {[{ value: "EMAIL", label: "Email Notifications" }, { value: "IN_APP", label: "In-App Notifications" }].map(ch => (
              <button
                key={ch.value}
                data-testid={`toggle-channel-${ch.value}`}
                onClick={() => toggleChannel(ch.value)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                  channels.includes(ch.value)
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-card border-border text-foreground hover:bg-muted'
                }`}
              >
                {ch.label}
                <div className={`w-10 h-6 rounded-full transition-colors flex items-center ${channels.includes(ch.value) ? 'bg-primary justify-end' : 'bg-muted justify-start'}`}>
                  <div className="w-4 h-4 mx-1 rounded-full bg-white shadow" />
                </div>
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={() => saveMutation.mutate({ alertFrequency: frequency, alertChannels: channels })}
          disabled={saveMutation.isPending}
          className="w-full py-3"
          data-testid="button-save-alerts"
        >
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Preferences
        </Button>

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-border">
            <h2 className="font-bold text-lg">Alert History</h2>
          </div>
          <div className="p-0">
            {loadingAlerts ? (
              <div className="p-8 text-center text-muted-foreground">Loading alerts...</div>
            ) : alerts && alerts.length > 0 ? (
              <div className="divide-y divide-border">
                {alerts.map((alert: any) => {
                  const alertJob = jobMap.get(alert.jobId);
                  return (
                    <div key={alert.id} data-testid={`row-alert-${alert.id}`} className="px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex-1">
                        <div className="font-medium">{alertJob?.title || `Job #${alert.jobId}`}</div>
                        <div className="text-xs text-muted-foreground">
                          Match: {Math.round(alert.matchScore * 100)}% • {alert.channel} • {alert.sentAt ? formatDistanceToNow(new Date(alert.sentAt), { addSuffix: true }) : "Recently"}
                        </div>
                      </div>
                      {alertJob && (
                        <Link href={`/jobs/${alert.jobId}`} className="text-primary text-xs font-semibold hover:underline flex items-center gap-1">
                          View <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Bell className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                <h3 className="font-bold">No alerts yet</h3>
                <p className="text-sm text-muted-foreground mt-1">You'll receive alerts when new jobs match your profile preferences.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function CvTab({ profile, fileInputRef, uploading, handleCvUpload }: any) {
  return (
    <>
      <h1 className="text-3xl font-display font-bold mb-2">My CV</h1>
      <p className="text-muted-foreground mb-8">Manage your CV document.</p>

      <div className="max-w-xl">
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          {profile?.cvUrl ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                <File className="w-8 h-8 text-primary flex-shrink-0" />
                <div className="overflow-hidden flex-1">
                  <p data-testid="text-cv-filename" className="font-medium truncate">{profile.cvFileName || "CV Document"}</p>
                  <p className="text-sm text-muted-foreground">Current CV</p>
                </div>
                <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer" data-testid="link-view-cv" className="text-primary font-semibold hover:underline flex-shrink-0">View</a>
              </div>
              <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleCvUpload} className="hidden" data-testid="input-cv-replace" />
              <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={uploading} data-testid="button-replace-cv">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? "Uploading..." : "Replace CV"}
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground/40" />
              <div>
                <h3 className="font-bold">No CV uploaded</h3>
                <p className="text-sm text-muted-foreground mt-1">Upload your CV to auto-attach it when applying to jobs.</p>
              </div>
              <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleCvUpload} className="hidden" data-testid="input-cv-upload" />
              <Button className="w-full" onClick={() => fileInputRef.current?.click()} disabled={uploading} data-testid="button-upload-cv">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? "Uploading..." : "Upload CV"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ApplicationsTab({ applications, jobs, employers, loadingApps }: any) {
  const jobMap = new Map(jobs?.map((j: any) => [j.id, j]) || []);
  const employerMap = new Map(employers?.map((e: any) => [e.id, e]) || []);

  const statusColors: Record<string, string> = {
    NEW: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
    REVIEWING: "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300",
    INTERVIEW: "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300",
    REJECTED: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300",
    OFFERED: "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300",
  };

  return (
    <>
      <h1 className="text-3xl font-display font-bold mb-2">My Applications</h1>
      <p className="text-muted-foreground mb-8">Track all your job applications.</p>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
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
              {applications.map((app: any) => {
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
            <Link href="/jobs" className="text-primary font-semibold hover:underline">Browse Jobs</Link>
          </div>
        )}
      </div>
    </>
  );
}

function SavedJobsTab({ savedJobs, jobs, employers }: any) {
  const jobMap = new Map(jobs?.map((j: any) => [j.id, j]) || []);
  const employerMap = new Map(employers?.map((e: any) => [e.id, e]) || []);

  return (
    <>
      <h1 className="text-3xl font-display font-bold mb-2">Saved Jobs</h1>
      <p className="text-muted-foreground mb-8">Jobs you've bookmarked for later.</p>

      {savedJobs && savedJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedJobs.map((saved: any) => {
            const savedJob = jobMap.get(saved.jobId);
            if (!savedJob) return null;
            const savedEmployer = savedJob.employerId ? employerMap.get(savedJob.employerId) : undefined;
            return <JobCard key={saved.id} job={savedJob} employerName={savedEmployer?.companyName} />;
          })}
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border shadow-sm p-12 text-center">
          <Bookmark className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <h3 className="font-bold">No saved jobs</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Bookmark jobs you're interested in to find them here later.</p>
          <Link href="/jobs" className="text-primary font-semibold hover:underline">Browse Jobs</Link>
        </div>
      )}
    </>
  );
}

export default function SeekerDashboard() {
  const { user } = useAuth();
  const { data: jobs } = useJobs();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [, tabParams] = useRoute("/dashboard/:tab");
  const currentTab = tabParams?.tab || "overview";

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
      const res = await fetch("/api/profile/cv", { method: "POST", body: formData, credentials: "include" });
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

  const renderTab = () => {
    switch (currentTab) {
      case "profile":
        return <ProfileTab profile={profile} />;
      case "alerts":
        return <AlertsTab profile={profile} />;
      case "cv":
        return <CvTab profile={profile} fileInputRef={fileInputRef} uploading={uploading} handleCvUpload={handleCvUpload} />;
      case "applications":
        return <ApplicationsTab applications={applications} jobs={jobs} employers={employers} loadingApps={loadingApps} />;
      case "saved-jobs":
        return <SavedJobsTab savedJobs={savedJobs} jobs={jobs} employers={employers} />;
      default:
        return (
          <OverviewTab
            user={user}
            jobs={jobs}
            employers={employers}
            applications={applications}
            savedJobs={savedJobs}
            profile={profile}
            loadingApps={loadingApps}
            fileInputRef={fileInputRef}
            uploading={uploading}
            handleCvUpload={handleCvUpload}
          />
        );
    }
  };

  return (
    <DashboardLayout role="JOB_SEEKER">
      {renderTab()}
    </DashboardLayout>
  );
}
