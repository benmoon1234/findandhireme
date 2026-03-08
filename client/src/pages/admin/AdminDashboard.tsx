import { DashboardLayout } from "../dashboard/DashboardLayout";
import { useJobs } from "@/hooks/use-jobs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Users, Briefcase, TrendingUp, FileText, CheckCircle2, XCircle, Eye, Shield, ShieldCheck, ShieldX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Employer, User } from "@shared/schema";

interface AdminStats {
  totalUsers: number;
  activeJobs: number;
  totalJobs: number;
  totalApplications: number;
}

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: jobs } = useJobs();

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: employers } = useQuery<Employer[]>({
    queryKey: ["/api/employers"],
  });

  const { data: allUsers, isLoading: usersLoading } = useQuery<Omit<User, "hashedPassword">[]>({
    queryKey: ["/api/admin/users"],
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ id, verified }: { id: number; verified: boolean }) => {
      await apiRequest("PATCH", `/api/employers/${id}/verify`, { verified });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Employer updated", description: "Verification status has been changed." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const totalUsers = stats?.totalUsers ?? 0;
  const activeJobs = stats?.activeJobs ?? 0;
  const totalApplications = stats?.totalApplications ?? 0;
  const totalJobs = stats?.totalJobs ?? 0;

  const unverifiedEmployers = employers?.filter(e => !e.verified) ?? [];

  return (
    <DashboardLayout role="ADMIN">
      <h1 data-testid="text-admin-title" className="text-3xl font-display font-bold mb-2">Admin Overview</h1>
      <p className="text-muted-foreground mb-8">Platform statistics and management tools.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            {statsLoading ? <Skeleton className="h-7 w-16 mb-1" /> : (
              <div data-testid="text-total-users" className="text-2xl font-bold">{totalUsers}</div>
            )}
            <div className="text-sm text-muted-foreground">Total Users</div>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-md bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            {statsLoading ? <Skeleton className="h-7 w-16 mb-1" /> : (
              <div data-testid="text-active-jobs" className="text-2xl font-bold">{activeJobs}</div>
            )}
            <div className="text-sm text-muted-foreground">Active Jobs</div>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-md bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            {statsLoading ? <Skeleton className="h-7 w-16 mb-1" /> : (
              <div data-testid="text-total-applications" className="text-2xl font-bold">{totalApplications}</div>
            )}
            <div className="text-sm text-muted-foreground">Total Applications</div>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-md bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            {statsLoading ? <Skeleton className="h-7 w-16 mb-1" /> : (
              <div data-testid="text-total-jobs" className="text-2xl font-bold">{totalJobs}</div>
            )}
            <div className="text-sm text-muted-foreground">Total Jobs</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="overflow-visible">
          <div className="px-6 py-5 border-b border-border">
            <h2 className="font-bold text-lg">Employer Verification Queue</h2>
          </div>
          <div className="divide-y divide-border">
            {unverifiedEmployers.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                All employers verified
              </div>
            ) : (
              unverifiedEmployers.map(emp => (
                <div key={emp.id} className="px-6 py-4 flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <div className="font-medium">{emp.companyName}</div>
                    <div className="text-sm text-muted-foreground">{emp.industry} - {emp.location}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      data-testid={`button-approve-${emp.id}`}
                      size="sm"
                      variant="outline"
                      disabled={verifyMutation.isPending}
                      onClick={() => verifyMutation.mutate({ id: emp.id, verified: true })}
                    >
                      <ShieldCheck className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      data-testid={`button-reject-${emp.id}`}
                      size="sm"
                      variant="outline"
                      disabled={verifyMutation.isPending}
                      onClick={() => verifyMutation.mutate({ id: emp.id, verified: false })}
                    >
                      <ShieldX className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="overflow-visible">
          <div className="px-6 py-5 border-b border-border">
            <h2 className="font-bold text-lg">Recent Job Listings</h2>
          </div>
          <div className="divide-y divide-border">
            {jobs?.slice(0, 5).map(job => (
              <div key={job.id} className="px-6 py-4 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <div className="font-medium text-sm">{job.title}</div>
                  <div className="text-xs text-muted-foreground">{job.location} - {job.country}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="w-3 h-3" /> {job.viewCount}
                  </span>
                  <Badge variant={job.status === "ACTIVE" ? "default" : "secondary"}>
                    {job.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-8 overflow-visible">
        <div className="px-6 py-5 border-b border-border flex justify-between items-center flex-wrap gap-2">
          <h2 className="font-bold text-lg">All Users ({allUsers?.length ?? 0})</h2>
        </div>
        <div className="overflow-x-auto">
          {usersLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allUsers?.map(user => (
                  <tr key={user.id} data-testid={`row-user-${user.id}`} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{user.name || "—"}</td>
                    <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" data-testid={`text-role-${user.id}`}>
                        {user.role === "SUPER_ADMIN" && <Shield className="w-3 h-3 mr-1" />}
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Card className="mt-8 overflow-visible">
        <div className="px-6 py-5 border-b border-border flex justify-between items-center flex-wrap gap-2">
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
                <tr key={job.id} data-testid={`row-job-${job.id}`} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium">{job.title}</td>
                  <td className="px-6 py-4 text-muted-foreground">{job.location}</td>
                  <td className="px-6 py-4 text-muted-foreground">{job.country}</td>
                  <td className="px-6 py-4 text-muted-foreground">{job.employmentType?.replace("_", " ")}</td>
                  <td className="px-6 py-4">
                    <Badge variant={job.status === "ACTIVE" ? "default" : "secondary"}>
                      {job.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">{job.isFeatured ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <span className="text-muted-foreground">-</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
