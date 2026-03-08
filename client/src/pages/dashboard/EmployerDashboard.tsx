import { useState } from "react";
import { DashboardLayout } from "./DashboardLayout";
import { Users, Briefcase, Eye, Plus, Trash2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { JobListing, Application } from "@shared/schema";

export default function EmployerDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);

  const { data: jobs = [], isLoading: jobsLoading } = useQuery<JobListing[]>({
    queryKey: ["/api/employer/jobs"],
  });

  const { data: allApplications = [], isLoading: appsLoading } = useQuery<Application[]>({
    queryKey: ["/api/employer/applications"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (jobId: number) => {
      await apiRequest("DELETE", `/api/jobs/${jobId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employer/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/employer/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({ title: "Job deleted", description: "The job listing has been removed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete job listing.", variant: "destructive" });
    },
  });

  const activeJobs = jobs.filter((j) => j.status === "ACTIVE");
  const totalApplicants = allApplications.length;

  const getApplicantsForJob = (jobId: number) =>
    allApplications.filter((a) => a.jobId === jobId);

  const isLoading = jobsLoading || appsLoading;

  return (
    <DashboardLayout role="EMPLOYER">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold" data-testid="text-employer-dashboard-title">Employer Overview</h1>
          <p className="text-muted-foreground mt-1">Manage your job listings and applicants.</p>
        </div>
        <Link href="/employer/post-job">
          <Button data-testid="button-post-new-job">
            <Plus className="w-5 h-5" /> Post New Job
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <Card className="p-6 flex items-center gap-4" data-testid="card-stat-active-listings">
          <div className="w-14 h-14 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Briefcase className="w-7 h-7" />
          </div>
          <div>
            {isLoading ? (
              <Skeleton className="h-8 w-12 mb-1" />
            ) : (
              <div className="text-3xl font-bold text-foreground" data-testid="text-active-listings-count">{activeJobs.length}</div>
            )}
            <div className="text-sm font-medium text-muted-foreground">Active Listings</div>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4" data-testid="card-stat-total-applicants">
          <div className="w-14 h-14 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
          <div>
            {isLoading ? (
              <Skeleton className="h-8 w-12 mb-1" />
            ) : (
              <div className="text-3xl font-bold text-foreground" data-testid="text-total-applicants-count">{totalApplicants}</div>
            )}
            <div className="text-sm font-medium text-muted-foreground">Total Applicants</div>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4" data-testid="card-stat-total-jobs">
          <div className="w-14 h-14 rounded-md bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 flex items-center justify-center">
            <Eye className="w-7 h-7" />
          </div>
          <div>
            {isLoading ? (
              <Skeleton className="h-8 w-12 mb-1" />
            ) : (
              <div className="text-3xl font-bold text-foreground" data-testid="text-total-jobs-count">{jobs.length}</div>
            )}
            <div className="text-sm font-medium text-muted-foreground">Total Jobs</div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden" data-testid="card-active-jobs">
        <div className="px-6 py-5 border-b border-border flex justify-between items-center gap-2 flex-wrap">
          <h2 className="font-bold text-lg">Your Jobs</h2>
          <Badge variant="secondary" data-testid="badge-job-count">{jobs.length} total</Badge>
        </div>
        <div className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground" data-testid="text-no-jobs">
              <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No jobs posted yet</p>
              <p className="text-sm mt-1">Create your first job listing to start receiving applications.</p>
            </div>
          ) : (
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
                {jobs.map((job) => {
                  const jobApplicants = getApplicantsForJob(job.id);
                  const isExpanded = expandedJobId === job.id;
                  return (
                    <JobRow
                      key={job.id}
                      job={job}
                      applicants={jobApplicants}
                      isExpanded={isExpanded}
                      onToggle={() => setExpandedJobId(isExpanded ? null : job.id)}
                      onDelete={() => deleteMutation.mutate(job.id)}
                      isDeleting={deleteMutation.isPending}
                    />
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </DashboardLayout>
  );
}

function JobRow({
  job,
  applicants,
  isExpanded,
  onToggle,
  onDelete,
  isDeleting,
}: {
  job: JobListing;
  applicants: Application[];
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const statusColor =
    job.status === "ACTIVE"
      ? "text-green-600 dark:text-green-400"
      : job.status === "CLOSED"
        ? "text-red-600 dark:text-red-400"
        : "text-muted-foreground";

  const dotColor =
    job.status === "ACTIVE"
      ? "bg-green-500"
      : job.status === "CLOSED"
        ? "bg-red-500"
        : "bg-muted-foreground";

  return (
    <>
      <tr className="hover:bg-muted/30 transition-colors" data-testid={`row-job-${job.id}`}>
        <td className="px-6 py-5 font-medium">
          <Link href={`/jobs/${job.id}`} className="hover:underline" data-testid={`link-job-title-${job.id}`}>
            {job.title}
          </Link>
          <br />
          <span className="text-muted-foreground text-xs font-normal">
            {job.isRemote ? "Remote" : job.location}
          </span>
        </td>
        <td className="px-6 py-5">
          <Badge variant="secondary" data-testid={`badge-applicants-${job.id}`}>
            {applicants.length} {applicants.length === 1 ? "applicant" : "applicants"}
          </Badge>
        </td>
        <td className="px-6 py-5">
          <span className={`flex items-center gap-1.5 font-medium ${statusColor}`}>
            <div className={`w-2 h-2 rounded-full ${dotColor}`} />
            {job.status}
          </span>
        </td>
        <td className="px-6 py-5 text-right">
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              data-testid={`button-view-applicants-${job.id}`}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span className="ml-1">{isExpanded ? "Hide" : "Applicants"}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              disabled={isDeleting}
              data-testid={`button-delete-job-${job.id}`}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr data-testid={`row-applicants-${job.id}`}>
          <td colSpan={4} className="px-6 py-4 bg-muted/20">
            {applicants.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2" data-testid={`text-no-applicants-${job.id}`}>
                No applicants yet for this job.
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Applicants ({applicants.length})
                </p>
                {applicants.map((app) => (
                  <Card key={app.id} className="p-4" data-testid={`card-applicant-${app.id}`}>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <p className="font-medium text-sm" data-testid={`text-applicant-id-${app.id}`}>
                          Applicant #{app.userId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            app.status === "NEW"
                              ? "default"
                              : app.status === "REVIEWED"
                                ? "secondary"
                                : app.status === "SHORTLISTED"
                                  ? "default"
                                  : "secondary"
                          }
                          data-testid={`badge-app-status-${app.id}`}
                        >
                          {app.status}
                        </Badge>
                        {app.cvUrl && (
                          <a
                            href={app.cvUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                            data-testid={`link-cv-${app.id}`}
                          >
                            View CV
                          </a>
                        )}
                      </div>
                    </div>
                    {app.coverLetter && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2" data-testid={`text-cover-letter-${app.id}`}>
                        {app.coverLetter}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
