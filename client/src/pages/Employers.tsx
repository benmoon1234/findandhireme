import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { usePageMeta } from "@/hooks/use-page-meta";
import { Building2, MapPin, Globe, CheckCircle2, ExternalLink } from "lucide-react";
import type { Employer } from "@shared/schema";

export default function Employers() {
  usePageMeta("Top Employers");
  const { data: employers, isLoading } = useQuery<Employer[]>({
    queryKey: ["/api/employers"],
    queryFn: async () => {
      const res = await fetch("/api/employers");
      if (!res.ok) throw new Error("Failed to fetch employers");
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 data-testid="text-employers-title" className="text-4xl font-display font-bold mb-4">Top Employers</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover verified employers actively hiring across the US, UK, Nigeria, and globally.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-card rounded-2xl animate-pulse border border-border" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {employers?.map(employer => (
                <Link key={employer.id} href={`/employers/${employer.slug}`}>
                  <div data-testid={`card-employer-${employer.id}`} className="bg-card rounded-2xl p-6 border border-border hover-elevate cursor-pointer h-full flex flex-col">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground border border-border flex-shrink-0">
                        <Building2 className="w-8 h-8" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg truncate">{employer.companyName}</h3>
                          {employer.verified && (
                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{employer.industry}</p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                      {employer.description || "No description provided."}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border">
                      {employer.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {employer.location}
                        </span>
                      )}
                      {employer.website && (
                        <span className="flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5" /> Website
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
