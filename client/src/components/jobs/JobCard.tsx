import { Link } from "wouter";
import { MapPin, DollarSign, Clock, Building2, BookmarkPlus } from "lucide-react";
import type { JobListing } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export function JobCard({ job, featured = false, employerName }: { job: JobListing; featured?: boolean; employerName?: string }) {
  return (
    <div data-testid={`card-job-${job.id}`} className={`
      bg-card rounded-2xl p-6 relative overflow-hidden group
      border border-border/60 hover-elevate
      ${featured ? 'ring-2 ring-primary/20 shadow-md shadow-primary/5' : 'shadow-sm shadow-black/5'}
    `}>
      {featured && (
        <div className="absolute top-0 right-0 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-bl-xl border-b border-l border-primary/10">
          Featured
        </div>
      )}
      
      <div className="flex gap-4 items-start">
        <div className="w-14 h-14 rounded-xl bg-secondary flex-shrink-0 flex items-center justify-center text-muted-foreground border border-border">
          <Building2 className="w-6 h-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <Link href={`/jobs/${job.id}`} className="block">
                <h3 data-testid={`text-job-title-${job.id}`} className="font-display font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                  {job.title}
                </h3>
              </Link>
              <div className="flex items-center text-muted-foreground mt-1 text-sm">
                <span data-testid={`text-employer-${job.id}`} className="font-medium text-foreground/80">{employerName || 'Company'}</span>
                <span className="mx-2">•</span>
                <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" /> {job.location}</span>
              </div>
            </div>
            
            <button data-testid={`button-bookmark-${job.id}`} className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/5">
              <BookmarkPlus className="w-5 h-5" />
            </button>
          </div>
          
          {job.shortDescription && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-1">{job.shortDescription}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium border border-border/50">
              {job.employmentType.replace('_', ' ')}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium border border-border/50">
              {job.experienceLevel}
            </span>
            {job.isRemote && (
              <span className="px-2.5 py-1 rounded-md bg-accent/10 text-accent-foreground text-xs font-medium border border-accent/20">
                Remote
              </span>
            )}
            {job.salaryMin && (
              <span className="px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium border border-green-200">
                <span className="flex items-center">
                  {job.salaryCurrency === "NGN" ? "₦" : job.salaryCurrency === "GBP" ? "£" : "$"}
                  {job.salaryMin.toLocaleString()} - {job.salaryMax?.toLocaleString()}
                </span>
              </span>
            )}
          </div>
          
          <div className="mt-5 pt-4 border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground">
            <span className="flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              Posted {job.postedAt ? formatDistanceToNow(new Date(job.postedAt), { addSuffix: true }) : 'recently'}
            </span>
            <Link 
              href={`/jobs/${job.id}`}
              data-testid={`link-view-job-${job.id}`}
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              View Details &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
