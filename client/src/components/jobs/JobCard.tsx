import { Link } from "wouter";
import { MapPin, DollarSign, Clock, Building2, BookmarkPlus } from "lucide-react";
import type { JobListing } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export function JobCard({ job, featured = false }: { job: JobListing, featured?: boolean }) {
  const isInternal = job.source === "INTERNAL";
  
  return (
    <div className={`
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
        {/* Company Logo Placeholder */}
        <div className="w-14 h-14 rounded-xl bg-secondary flex-shrink-0 flex items-center justify-center text-muted-foreground border border-border">
          <Building2 className="w-6 h-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <Link href={`/jobs/${job.id}`} className="block">
                <h3 className="font-display font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                  {job.title}
                </h3>
              </Link>
              <div className="flex items-center text-muted-foreground mt-1 text-sm">
                <span className="font-medium text-foreground/80">{job.employerId ? 'Acme Corp' : 'External Partner'}</span>
                <span className="mx-2">•</span>
                <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" /> {job.location}</span>
              </div>
            </div>
            
            <button className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/5">
              <BookmarkPlus className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium border border-border/50">
              {job.employmentType.replace('_', ' ')}
            </span>
            {job.isRemote && (
              <span className="px-2.5 py-1 rounded-md bg-accent/10 text-accent-foreground text-xs font-medium border border-accent/20">
                Remote
              </span>
            )}
            {job.salaryMin && (
              <span className="px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium border border-green-200">
                <span className="flex items-center"><DollarSign className="w-3 h-3 mr-0.5" /> {job.salaryMin.toLocaleString()} - {job.salaryMax?.toLocaleString()}</span>
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
