import { useRoute, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JobCard } from "@/components/jobs/JobCard";
import { useQuery } from "@tanstack/react-query";
import { useJobs } from "@/hooks/use-jobs";
import { usePageMeta } from "@/hooks/use-page-meta";
import { Building2, MapPin, Globe, CheckCircle2, ExternalLink, ArrowLeft } from "lucide-react";
import type { Employer } from "@shared/schema";

export default function EmployerProfile() {
  const [, params] = useRoute("/employers/:slug");
  const slug = params?.slug || "";

  const { data: employer, isLoading } = useQuery<Employer>({
    queryKey: ["/api/employers", slug],
    queryFn: async () => {
      const res = await fetch(`/api/employers/${slug}`);
      if (!res.ok) throw new Error("Employer not found");
      return res.json();
    },
    enabled: !!slug,
  });

  usePageMeta(employer ? employer.companyName : "Employer Profile");
  const { data: allJobs } = useJobs();
  const employerJobs = allJobs?.filter(j => j.employerId === employer?.id) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 pt-32 text-center">Loading...</div>
      </div>
    );
  }

  if (!employer) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 pt-32 text-center text-xl">Employer not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/employers" className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Employers
          </Link>

          <div className="bg-card rounded-3xl border border-border overflow-hidden mb-8">
            <div className="h-32 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/5" />
            <div className="px-8 pb-8 -mt-10">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="w-20 h-20 rounded-2xl bg-card border-4 border-card shadow-lg flex items-center justify-center text-muted-foreground">
                  <Building2 className="w-10 h-10" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 data-testid="text-employer-name" className="text-3xl font-display font-bold">{employer.companyName}</h1>
                    {employer.verified && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {employer.industry && <span>{employer.industry}</span>}
                    {employer.location && (
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {employer.location}</span>
                    )}
                    {employer.website && (
                      <a href={employer.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                        <Globe className="w-4 h-4" /> Website <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {employer.description && (
                <div className="mt-8">
                  <h2 className="text-lg font-bold mb-3">About {employer.companyName}</h2>
                  <p className="text-muted-foreground leading-relaxed">{employer.description}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-display font-bold mb-6">
              Open Positions ({employerJobs.length})
            </h2>
            {employerJobs.length > 0 ? (
              <div className="space-y-4">
                {employerJobs.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center">
                <p className="text-muted-foreground">No open positions at this time.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
