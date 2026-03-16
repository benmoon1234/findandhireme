import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JobCard } from "@/components/jobs/JobCard";
import { useJobs } from "@/hooks/use-jobs";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Search, Loader2, ChevronLeft, ChevronRight, ExternalLink, Building2, Clock, Briefcase, PoundSterling } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const countryConfig: Record<string, { name: string; flag: string; currency: string }> = {
  us: { name: "United States", flag: "US", currency: "USD" },
  uk: { name: "United Kingdom", flag: "GB", currency: "GBP" },
  nigeria: { name: "Nigeria", flag: "NG", currency: "NGN" },
};

interface WhatJobsResult {
  title: string;
  company: string | null;
  location: string;
  postcode: string;
  snippet: string;
  url: string;
  onmousedown: string;
  job_type: string;
  salary: string;
  logo: string | null;
  age: string;
  age_days: number;
}

interface WhatJobsResponse {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
  data: WhatJobsResult[];
}

function handleWhatJobsTracking(onmousedown: string | undefined | null) {
  if (!onmousedown) return;
  const match = onmousedown.match(/pnpClick\(this,\s*'([^']+)'\)/);
  if (match && match[1]) {
    const img = new Image();
    img.src = `https://uk.whatjobs.com/pnp?t=${encodeURIComponent(match[1])}`;
  }
}

function WhatJobsJobCard({ job }: { job: WhatJobsResult }) {
  const cleanSnippet = job.snippet
    ?.replace(/<span class="highlighted">/g, "")
    .replace(/<\/span>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim() || "";

  return (
    <Card className="p-5 hover:shadow-md transition-shadow" data-testid={`card-whatjobs-${job.url}`}>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              onMouseDown={() => handleWhatJobsTracking(job.onmousedown)}
              className="text-lg font-bold text-primary hover:underline inline-flex items-center gap-1.5"
              data-testid={`link-whatjobs-title`}
            >
              {job.title}
              <ExternalLink className="w-4 h-4 flex-shrink-0" />
            </a>
            {job.company && (
              <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                <Building2 className="w-3.5 h-3.5" />
                {job.company}
              </div>
            )}
          </div>
          {job.logo && (
            <img src={job.logo} alt="" className="w-10 h-10 rounded object-contain flex-shrink-0" />
          )}
        </div>

        {cleanSnippet && (
          <p className="text-sm text-muted-foreground line-clamp-2">{cleanSnippet}</p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {job.location}
            </span>
          )}
          {job.salary && (
            <span className="flex items-center gap-1">
              <PoundSterling className="w-3.5 h-3.5" />
              {job.salary}
            </span>
          )}
          {job.job_type && (
            <Badge variant="secondary" className="text-xs capitalize">
              <Briefcase className="w-3 h-3 mr-1" />
              {job.job_type}
            </Badge>
          )}
          {job.age && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {job.age}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

function UKJobsPage() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [page, setPage] = useState(1);

  const { data: whatJobsData, isLoading: whatJobsLoading, isError } = useQuery<WhatJobsResponse>({
    queryKey: ["/api/whatjobs", searchKeyword, searchLocation, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchKeyword) params.set("keyword", searchKeyword);
      if (searchLocation) params.set("location", searchLocation);
      params.set("page", String(page));
      params.set("limit", "20");
      const res = await fetch(`/api/whatjobs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return res.json();
    },
  });

  const { data: allJobs } = useJobs();
  const dbJobs = allJobs?.filter(j => j.country === "UK") || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchKeyword(keyword);
    setSearchLocation(location);
    setPage(1);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const totalResults = whatJobsData?.total ?? 0;
  const lastPage = whatJobsData?.last_page ?? 1;
  const jobs = whatJobsData?.data ?? [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 data-testid="text-country-title" className="text-4xl font-display font-bold mb-3">
              <MapPin className="w-8 h-8 inline mr-2 text-primary" />
              Jobs in United Kingdom
            </h1>
            <p className="text-muted-foreground text-lg">
              Search thousands of live UK job listings
            </p>
          </div>

          <form onSubmit={handleSearch} className="mb-8" data-testid="form-whatjobs-search">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  placeholder="Job title, keyword, or company"
                  className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  data-testid="input-whatjobs-keyword"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="City, postcode, or region"
                  className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  data-testid="input-whatjobs-location"
                />
              </div>
              <Button type="submit" className="px-8 py-3 rounded-xl" data-testid="button-whatjobs-search">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </form>

          <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold" data-testid="text-whatjobs-results-heading">
                {whatJobsLoading ? "Searching..." : `${totalResults.toLocaleString()} jobs found`}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Powered by</span>
              <a href="https://uk.whatjobs.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                WhatJobs
              </a>
            </div>
          </div>

          {whatJobsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Unable to load jobs right now. Please try again later.</p>
            </Card>
          ) : jobs.length > 0 ? (
            <>
              <div className="space-y-3 mb-8">
                {jobs.map((job, index) => (
                  <WhatJobsJobCard key={`${job.url}-${index}`} job={job} />
                ))}
              </div>

              {lastPage > 1 && (
                <div className="flex items-center justify-center gap-2" data-testid="pagination-whatjobs">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    data-testid="button-whatjobs-prev"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-3">
                    Page {page} of {lastPage.toLocaleString()}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= lastPage}
                    onClick={() => setPage(p => p + 1)}
                    data-testid="button-whatjobs-next"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card className="p-8 text-center border-dashed">
              <h3 className="text-lg font-bold">No jobs found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your search terms or location.</p>
            </Card>
          )}

          {dbJobs.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-display font-bold mb-6" data-testid="text-platform-jobs-heading">
                Platform Job Listings
              </h2>
              <div className="space-y-4">
                {dbJobs.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CountryJobs() {
  const [, params] = useRoute("/jobs/:country");
  const countrySlug = params?.country || "";
  const config = countryConfig[countrySlug];
  const countryCode = countrySlug === "us" ? "US" : countrySlug === "uk" ? "UK" : "NG";

  if (countrySlug === "uk") {
    return <UKJobsPage />;
  }

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
