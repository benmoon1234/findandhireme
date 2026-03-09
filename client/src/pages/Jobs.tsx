import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JobCard } from "@/components/jobs/JobCard";
import { useJobs } from "@/hooks/use-jobs";
import { useQuery } from "@tanstack/react-query";
import { usePageMeta } from "@/hooks/use-page-meta";
import { Search, MapPin, Filter, X, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import type { Employer } from "@shared/schema";

const JOBS_PER_PAGE = 12;

const EMPLOYMENT_TYPES = [
  { value: "FULL_TIME", label: "Full-Time" },
  { value: "PART_TIME", label: "Part-Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "FREELANCE", label: "Freelance" },
];

const EXPERIENCE_LEVELS = [
  { value: "ENTRY", label: "Entry Level" },
  { value: "MID", label: "Mid Level" },
  { value: "SENIOR", label: "Senior" },
  { value: "EXECUTIVE", label: "Executive" },
];

const COUNTRIES = [
  { value: "ALL", label: "All Countries" },
  { value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "NG", label: "Nigeria" },
  { value: "GLOBAL", label: "Remote / Global" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "salary-desc", label: "Salary: High to Low" },
  { value: "salary-asc", label: "Salary: Low to High" },
  { value: "featured", label: "Featured First" },
];

export default function Jobs() {
  usePageMeta("Explore Jobs", "Browse job opportunities across US, UK, Nigeria, and remote positions.");
  const { data: jobs, isLoading } = useJobs();
  const { data: employers } = useQuery<Employer[]>({
    queryKey: ["/api/employers"],
  });

  const [keyword, setKeyword] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [country, setCountry] = useState("ALL");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, locationSearch, country, selectedTypes, selectedLevels, remoteOnly, sortBy]);

  const employerMap = useMemo(() => {
    const map: Record<number, string> = {};
    employers?.forEach(e => { map[e.id] = e.companyName; });
    return map;
  }, [employers]);

  const filteredJobs = useMemo(() => {
    if (!jobs) return [];

    let result = [...jobs];

    if (keyword.trim()) {
      const kw = keyword.toLowerCase();
      result = result.filter(j =>
        j.title.toLowerCase().includes(kw) ||
        (j.description && j.description.toLowerCase().includes(kw)) ||
        (j.shortDescription && j.shortDescription.toLowerCase().includes(kw)) ||
        (j.skills && j.skills.some((s: string) => s.toLowerCase().includes(kw))) ||
        (j.industry && j.industry.toLowerCase().includes(kw))
      );
    }

    if (locationSearch.trim()) {
      const loc = locationSearch.toLowerCase();
      result = result.filter(j =>
        j.location.toLowerCase().includes(loc) ||
        (j.city && j.city.toLowerCase().includes(loc)) ||
        (j.state && j.state.toLowerCase().includes(loc))
      );
    }

    if (country !== "ALL") {
      result = result.filter(j => j.country === country);
    }

    if (selectedTypes.length > 0) {
      result = result.filter(j => selectedTypes.includes(j.employmentType));
    }

    if (selectedLevels.length > 0) {
      result = result.filter(j => selectedLevels.includes(j.experienceLevel));
    }

    if (remoteOnly) {
      result = result.filter(j => j.isRemote);
    }

    switch (sortBy) {
      case "recent":
        result.sort((a, b) => new Date(b.postedAt || 0).getTime() - new Date(a.postedAt || 0).getTime());
        break;
      case "salary-desc":
        result.sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0));
        break;
      case "salary-asc":
        result.sort((a, b) => (a.salaryMin || 0) - (b.salaryMin || 0));
        break;
      case "featured":
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return result;
  }, [jobs, keyword, locationSearch, country, selectedTypes, selectedLevels, remoteOnly, sortBy]);

  const toggleType = (value: string) => {
    setSelectedTypes(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const toggleLevel = (value: string) => {
    setSelectedLevels(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const clearFilters = () => {
    setKeyword("");
    setLocationSearch("");
    setCountry("ALL");
    setSelectedTypes([]);
    setSelectedLevels([]);
    setRemoteOnly(false);
    setSortBy("recent");
  };

  const hasActiveFilters = keyword || locationSearch || country !== "ALL" || selectedTypes.length > 0 || selectedLevels.length > 0 || remoteOnly;

  const filterSidebar = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</h3>
        {hasActiveFilters && (
          <button data-testid="button-clear-filters" onClick={clearFilters} className="text-xs text-primary font-medium hover:underline">
            Clear All
          </button>
        )}
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Employment Type</h4>
        <div className="space-y-2">
          {EMPLOYMENT_TYPES.map(t => (
            <label key={t.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                data-testid={`checkbox-type-${t.value}`}
                checked={selectedTypes.includes(t.value)}
                onChange={() => toggleType(t.value)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      <hr className="border-border" />

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Experience Level</h4>
        <div className="space-y-2">
          {EXPERIENCE_LEVELS.map(t => (
            <label key={t.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                data-testid={`checkbox-level-${t.value}`}
                checked={selectedLevels.includes(t.value)}
                onChange={() => toggleLevel(t.value)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      <hr className="border-border" />

      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-sm font-medium text-foreground">Remote Only</span>
        <button
          data-testid="button-remote-toggle"
          onClick={() => setRemoteOnly(!remoteOnly)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${remoteOnly ? 'bg-primary' : 'bg-muted'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${remoteOnly ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </label>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 data-testid="text-jobs-title" className="text-3xl font-display font-bold mb-6">Explore Jobs</h1>

            <div className="bg-card p-2 rounded-2xl shadow-md border border-border flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center px-4 bg-muted/30 rounded-xl">
                <Search className="w-5 h-5 text-muted-foreground mr-3" />
                <input
                  type="text"
                  data-testid="input-keyword"
                  placeholder="Job title, keywords, skills..."
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-none py-3 text-foreground"
                />
              </div>
              <div className="flex-1 flex items-center px-4 bg-muted/30 rounded-xl">
                <MapPin className="w-5 h-5 text-muted-foreground mr-3" />
                <input
                  type="text"
                  data-testid="input-location"
                  placeholder="City or state..."
                  value={locationSearch}
                  onChange={e => setLocationSearch(e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-none py-3 text-foreground"
                />
              </div>
              <select
                data-testid="select-country"
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="bg-muted/30 border-none rounded-xl px-4 py-3 focus:outline-none text-foreground font-medium"
              >
                {COUNTRIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <button
                data-testid="button-mobile-filters"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="md:hidden bg-secondary text-secondary-foreground font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {keyword && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  "{keyword}" <X className="w-3 h-3 cursor-pointer" onClick={() => setKeyword("")} />
                </span>
              )}
              {locationSearch && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {locationSearch} <X className="w-3 h-3 cursor-pointer" onClick={() => setLocationSearch("")} />
                </span>
              )}
              {country !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {COUNTRIES.find(c => c.value === country)?.label} <X className="w-3 h-3 cursor-pointer" onClick={() => setCountry("ALL")} />
                </span>
              )}
              {selectedTypes.map(t => (
                <span key={t} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {EMPLOYMENT_TYPES.find(et => et.value === t)?.label} <X className="w-3 h-3 cursor-pointer" onClick={() => toggleType(t)} />
                </span>
              ))}
              {selectedLevels.map(l => (
                <span key={l} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {EXPERIENCE_LEVELS.find(el => el.value === l)?.label} <X className="w-3 h-3 cursor-pointer" onClick={() => toggleLevel(l)} />
                </span>
              ))}
              {remoteOnly && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  Remote Only <X className="w-3 h-3 cursor-pointer" onClick={() => setRemoteOnly(false)} />
                </span>
              )}
            </div>
          )}

          {showMobileFilters && (
            <div className="md:hidden bg-card rounded-2xl border border-border p-6 mb-6 animate-slide-up">
              {filterSidebar}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="w-full lg:w-64 flex-shrink-0 hidden md:block">
              {filterSidebar}
            </aside>

            <div className="flex-1">
              {(() => {
                const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
                const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
                const endIndex = startIndex + JOBS_PER_PAGE;
                const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

                return (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <p data-testid="text-job-count" className="text-muted-foreground text-sm">
                        {filteredJobs.length > 0 ? (
                          <>Showing <span className="font-semibold text-foreground">{startIndex + 1}-{Math.min(endIndex, filteredJobs.length)}</span> of {filteredJobs.length} jobs</>
                        ) : (
                          <>Showing <span className="font-semibold text-foreground">0</span> of {jobs?.length || 0} jobs</>
                        )}
                      </p>
                      <select
                        data-testid="select-sort"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="border-none bg-transparent font-medium cursor-pointer focus:outline-none text-sm"
                      >
                        {SORT_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-4">
                      {isLoading ? (
                        Array(5).fill(0).map((_, i) => <div key={i} className="h-40 bg-card rounded-2xl animate-pulse border border-border" />)
                      ) : paginatedJobs.length > 0 ? (
                        paginatedJobs.map(job => (
                          <JobCard key={job.id} job={job} featured={job.isFeatured} employerName={job.employerId ? employerMap[job.employerId] : undefined} />
                        ))
                      ) : (
                        <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
                          <h3 className="text-lg font-bold">No jobs match your criteria</h3>
                          <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
                          {hasActiveFilters && (
                            <button data-testid="button-clear-all" onClick={clearFilters} className="mt-4 text-primary font-semibold hover:underline">
                              Clear all filters
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-8" data-testid="pagination-controls">
                        <button
                          data-testid="button-prev-page"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2)
                          .reduce<(number | string)[]>((acc, page, idx, arr) => {
                            if (idx > 0 && page - (arr[idx - 1] as number) > 1) acc.push("...");
                            acc.push(page);
                            return acc;
                          }, [])
                          .map((item, idx) =>
                            typeof item === "string" ? (
                              <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
                            ) : (
                              <button
                                key={item}
                                data-testid={`button-page-${item}`}
                                onClick={() => setCurrentPage(item)}
                                className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors ${currentPage === item ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-muted text-foreground"}`}
                              >
                                {item}
                              </button>
                            )
                          )}
                        <button
                          data-testid="button-next-page"
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
