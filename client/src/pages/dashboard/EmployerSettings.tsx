import { DashboardLayout } from "./DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { usePageMeta } from "@/hooks/use-page-meta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Loader2, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import type { Employer } from "@shared/schema";

const COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "NG", label: "Nigeria" },
  { value: "GLOBAL", label: "Global / Remote" },
];

export default function EmployerSettings() {
  usePageMeta("Company Settings");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: employer, isLoading } = useQuery<Employer>({
    queryKey: ["/api/employer/profile"],
  });

  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("US");

  useEffect(() => {
    if (employer) {
      setCompanyName(employer.companyName || "");
      setDescription(employer.description || "");
      setIndustry(employer.industry || "");
      setWebsite(employer.website || "");
      setLocation(employer.location || "");
      setCountry(employer.country || "US");
    }
  }, [employer]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", "/api/employer/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employer/profile"] });
      toast({ title: "Profile updated", description: "Your company profile has been saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ companyName, description, industry, website, location, country });
  };

  const hasError = !isLoading && !employer;

  if (isLoading) {
    return (
      <DashboardLayout role="EMPLOYER">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (hasError) {
    return (
      <DashboardLayout role="EMPLOYER">
        <div className="text-center py-20">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <h2 className="text-lg font-bold">Employer Profile Not Found</h2>
          <p className="text-muted-foreground mt-1">Please contact support if you believe this is an error.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="EMPLOYER">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold flex items-center gap-3" data-testid="text-settings-title">
          <Building2 className="w-8 h-8 text-primary" /> Company Settings
        </h1>
        <p className="text-muted-foreground mt-1">Update your company profile information.</p>
      </div>

      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Company Name</label>
            <input
              data-testid="input-company-name"
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              data-testid="input-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Industry</label>
              <input
                data-testid="input-industry"
                type="text"
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Website</label>
              <input
                data-testid="input-website"
                type="url"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                data-testid="input-location"
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="City, State"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <select
                data-testid="select-country"
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {COUNTRIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={mutation.isPending} data-testid="button-save-profile">
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </DashboardLayout>
  );
}
