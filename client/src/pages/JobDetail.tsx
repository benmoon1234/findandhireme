import { useState, useEffect, useRef } from "react";
import { useRoute, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useJob } from "@/hooks/use-jobs";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Building2, MapPin, Clock, Share2, Bookmark, ExternalLink, ArrowLeft, CheckCircle2, Send, X, Briefcase, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Employer } from "@shared/schema";

export default function JobDetail() {
  const [, params] = useRoute("/jobs/:id");
  const id = parseInt(params?.id || "0");
  const { data: job, isLoading } = useJob(id);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const viewTracked = useRef(false);

  useEffect(() => {
    if (id && !viewTracked.current) {
      viewTracked.current = true;
      fetch(`/api/jobs/${id}/view`, { method: "POST", credentials: "include" }).catch(() => {});
    }
  }, [id]);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  const { data: employers } = useQuery<Employer[]>({
    queryKey: ["/api/employers"],
  });

  const employer = employers?.find(e => e.id === job?.employerId);

  const { data: existingApplications } = useQuery<any[]>({
    queryKey: ["/api/applications"],
    enabled: !!user,
  });

  const { data: seekerProfile } = useQuery<any>({
    queryKey: ["/api/profile"],
    enabled: !!user && user.role === "JOB_SEEKER",
  });

  const hasApplied = existingApplications?.some(a => a.jobId === id);

  const { data: savedJobsList } = useQuery<any[]>({
    queryKey: ["/api/saved-jobs"],
    enabled: !!user,
  });

  const isSaved = savedJobsList?.some(s => s.jobId === id) ?? false;

  const saveJobMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/saved-jobs", { jobId: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-jobs"] });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to save job", description: err.message, variant: "destructive" });
    },
  });

  const unsaveJobMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/saved-jobs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-jobs"] });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to unsave job", description: err.message, variant: "destructive" });
    },
  });

  const handleBookmark = () => {
    if (!user) {
      window.location.href = "/auth";
      return;
    }
    if (isSaved) {
      unsaveJobMutation.mutate();
    } else {
      saveJobMutation.mutate();
    }
  };

  const applyMutation = useMutation({
    mutationFn: async (data: { jobId: number; coverLetter?: string; cvUrl?: string }) => {
      const res = await apiRequest("POST", "/api/applications", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      setShowApplyModal(false);
      setCoverLetter("");
      toast({ title: "Application submitted!", description: "Your application has been sent to the employer." });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to apply", description: err.message, variant: "destructive" });
    },
  });

  const handleApply = () => {
    if (!user) {
      window.location.href = "/auth";
      return;
    }
    applyMutation.mutate({
      jobId: id,
      coverLetter: coverLetter || undefined,
      cvUrl: seekerProfile?.cvUrl || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 pt-32 text-center text-muted-foreground">Loading job details...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 pt-32 text-center">
          <h2 className="text-2xl font-bold">Job not found</h2>
          <Link href="/jobs" className="text-primary font-semibold mt-4 inline-block">Browse all jobs</Link>
        </div>
      </div>
    );
  }

  const currencySymbol = job.salaryCurrency === "NGN" ? "₦" : job.salaryCurrency === "GBP" ? "£" : "$";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Jobs
          </Link>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <h1 data-testid="text-job-title" className="text-3xl md:text-4xl font-display font-bold">{job.title}</h1>
                    <div className="flex items-center text-muted-foreground mt-3 text-sm md:text-base gap-4">
                      {employer ? (
                        <Link href={`/employers/${employer.slug}`} className="flex items-center text-primary font-semibold hover:underline">
                          <Building2 className="w-5 h-5 mr-1" /> {employer.companyName}
                        </Link>
                      ) : (
                        <span className="flex items-center text-primary font-semibold"><Building2 className="w-5 h-5 mr-1" /> Company</span>
                      )}
                      <span className="flex items-center"><MapPin className="w-5 h-5 mr-1" /> {job.location}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button data-testid="button-share" className="p-3 rounded-xl border border-border hover:bg-muted text-foreground transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button
                      data-testid="button-bookmark"
                      onClick={handleBookmark}
                      disabled={saveJobMutation.isPending || unsaveJobMutation.isPending}
                      className={`p-3 rounded-xl border transition-colors ${
                        isSaved
                          ? 'border-primary/30 bg-primary/10 text-primary'
                          : 'border-border hover:bg-muted text-foreground'
                      }`}
                    >
                      <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-8 pb-8 border-b border-border">
                  <span className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">
                    {job.employmentType.replace('_', ' ')}
                  </span>
                  <span className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">
                    {job.experienceLevel} Level
                  </span>
                  {job.salaryMin && (
                    <span data-testid="text-salary" className="px-4 py-2 rounded-lg bg-green-50 text-green-700 text-sm font-bold border border-green-200">
                      {currencySymbol}{job.salaryMin.toLocaleString()} - {currencySymbol}{job.salaryMax?.toLocaleString()}
                    </span>
                  )}
                  {job.isRemote && (
                    <span className="px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-bold border border-blue-200">
                      Fully Remote
                    </span>
                  )}
                  {job.country && (
                    <span className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">
                      {job.country === "US" ? "United States" : job.country === "UK" ? "United Kingdom" : job.country === "NG" ? "Nigeria" : "Global"}
                    </span>
                  )}
                </div>

                <div className="prose max-w-none text-foreground/80">
                  <h3 className="text-xl font-bold text-foreground mb-4">Job Description</h3>
                  <div className="whitespace-pre-line leading-relaxed">{job.description}</div>

                  {job.skills && job.skills.length > 0 && (
                    <>
                      <h3 className="text-xl font-bold text-foreground mt-8 mb-4">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill: string, i: number) => (
                          <span key={i} data-testid={`tag-skill-${i}`} className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="sticky top-28 space-y-6">
                <div className="bg-card rounded-3xl p-6 border border-border shadow-sm text-center">
                  <div className="w-20 h-20 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center border border-border shadow-inner">
                    <Building2 className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 data-testid="text-employer-name" className="font-bold text-xl mb-1">{employer?.companyName || "Company"}</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {employer?.industry || "Technology"} • {employer?.location || job.location}
                  </p>

                  {hasApplied ? (
                    <div data-testid="text-applied" className="w-full flex items-center justify-center gap-2 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 py-3.5 rounded-xl font-bold border border-green-200 dark:border-green-800">
                      <CheckCircle2 className="w-5 h-5" /> Applied
                    </div>
                  ) : job.source === 'AGGREGATOR' ? (
                    <a
                      href={job.externalUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="link-apply-external"
                      className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30"
                      onClick={() => {
                        fetch(`/api/jobs/${id}/click`, { method: "POST", credentials: "include" }).catch(() => {});
                      }}
                    >
                      Apply on Partner Site <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <button
                      data-testid="button-apply"
                      onClick={() => user ? setShowApplyModal(true) : (window.location.href = "/auth")}
                      className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5"
                    >
                      Apply Now
                    </button>
                  )}

                  <p className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Posted {job.postedAt ? formatDistanceToNow(new Date(job.postedAt), { addSuffix: true }) : 'recently'}
                  </p>

                  {employer && (
                    <Link href={`/employers/${employer.slug}`} data-testid="link-employer-profile" className="block mt-4 text-sm text-primary font-semibold hover:underline">
                      View Employer Profile
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowApplyModal(false)}>
          <div className="bg-card rounded-3xl border border-border shadow-2xl w-full max-w-lg p-8 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-display font-bold">Apply for this role</h2>
                <p className="text-muted-foreground mt-1">{job.title} at {employer?.companyName || "Company"}</p>
              </div>
              <button data-testid="button-close-modal" onClick={() => setShowApplyModal(false)} className="p-2 rounded-xl hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="bg-muted/30 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{user?.name || "You"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              {seekerProfile?.cvUrl && (
                <div data-testid="text-cv-attached" className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 flex items-center gap-3 border border-green-200 dark:border-green-800">
                  <FileText className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">CV attached</p>
                    <p className="text-xs text-green-600 dark:text-green-400 truncate">{seekerProfile.cvFileName || "Your CV"}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Cover Letter (Optional)</label>
                <textarea
                  data-testid="input-cover-letter"
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                  placeholder="Tell the employer why you're a great fit for this role..."
                  rows={6}
                  className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                />
              </div>

              <button
                data-testid="button-submit-application"
                onClick={handleApply}
                disabled={applyMutation.isPending}
                className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {applyMutation.isPending ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit Application
                  </>
                )}
              </button>

              <p className="text-xs text-center text-muted-foreground">
                By applying, you agree to share your profile information with the employer.
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
