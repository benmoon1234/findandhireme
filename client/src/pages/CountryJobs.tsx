import { useRoute } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JobCard } from "@/components/jobs/JobCard";
import { useJobs } from "@/hooks/use-jobs";
import { MapPin } from "lucide-react";

const countryConfig: Record<string, { name: string; flag: string; currency: string }> = {
  us: { name: "United States", flag: "US", currency: "USD" },
  uk: { name: "United Kingdom", flag: "GB", currency: "GBP" },
  nigeria: { name: "Nigeria", flag: "NG", currency: "NGN" },
};

export default function CountryJobs() {
  const [, params] = useRoute("/jobs/:country");
  const countrySlug = params?.country || "";
  const config = countryConfig[countrySlug];
  const countryCode = countrySlug === "us" ? "US" : countrySlug === "uk" ? "UK" : "NG";

  const { data: allJobs, isLoading } = useJobs();
  const jobs = allJobs?.filter(j => j.country === countryCode) || [];

  if (!config) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 data-testid="text-country-title" className="text-4xl font-display font-bold mb-3">
              <MapPin className="w-8 h-8 inline mr-2 text-primary" />
              Jobs in {config.name}
            </h1>
            <p className="text-muted-foreground text-lg">
              Browse {jobs.length} open positions in {config.name}
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 bg-card rounded-2xl animate-pulse border border-border" />
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-dashed border-border p-16 text-center">
              <h3 className="text-lg font-bold">No jobs found in {config.name}</h3>
              <p className="text-muted-foreground mt-2">Check back soon for new listings.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
