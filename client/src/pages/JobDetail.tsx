import { useRoute } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useJob } from "@/hooks/use-jobs";
import { Building2, MapPin, DollarSign, Clock, Share2, BookmarkPlus, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function JobDetail() {
  const [, params] = useRoute("/jobs/:id");
  const id = parseInt(params?.id || "0");
  const { data: job, isLoading } = useJob(id);

  if (isLoading) {
    return <div className="min-h-screen pt-32 text-center">Loading...</div>;
  }

  if (!job) {
    return <div className="min-h-screen pt-32 text-center text-xl">Job not found</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold">{job.title}</h1>
                    <div className="flex items-center text-muted-foreground mt-3 text-sm md:text-base gap-4">
                      <span className="flex items-center text-primary font-semibold"><Building2 className="w-5 h-5 mr-1" /> Acme Corp</span>
                      <span className="flex items-center"><MapPin className="w-5 h-5 mr-1" /> {job.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="p-3 rounded-xl border border-border hover:bg-muted text-foreground transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button className="p-3 rounded-xl border border-border hover:bg-muted text-foreground transition-colors">
                      <BookmarkPlus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-8 pb-8 border-b border-border">
                  <span className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">
                    {job.employmentType.replace('_', ' ')}
                  </span>
                  <span className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">
                    {job.experienceLevel} Level
                  </span>
                  {job.salaryMin && (
                    <span className="px-4 py-2 rounded-lg bg-green-50 text-green-700 text-sm font-bold border border-green-200">
                      ${job.salaryMin.toLocaleString()} - ${job.salaryMax?.toLocaleString()}
                    </span>
                  )}
                  {job.isRemote && (
                    <span className="px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-bold border border-blue-200">
                      Fully Remote
                    </span>
                  )}
                </div>

                <div className="prose max-w-none text-foreground/80">
                  <h3 className="text-xl font-bold text-foreground mb-4">Job Description</h3>
                  <div dangerouslySetInnerHTML={{ __html: job.description || 'No description provided.' }} />
                  
                  {job.skills && job.skills.length > 0 && (
                    <>
                      <h3 className="text-xl font-bold text-foreground mt-8 mb-4">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill: string, i: number) => (
                          <span key={i} className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Sticky */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="sticky top-28 space-y-6">
                
                {/* Apply Card */}
                <div className="bg-card rounded-3xl p-6 border border-border shadow-sm text-center">
                  <div className="w-20 h-20 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center border border-border shadow-inner">
                    <Building2 className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-xl mb-1">Acme Corporation</h3>
                  <p className="text-sm text-muted-foreground mb-6">Technology • San Francisco, CA</p>
                  
                  {job.source === 'AGGREGATOR' ? (
                    <a href={job.externalUrl || '#'} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30">
                      Apply on Partner Site <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <button className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5">
                      Apply Now
                    </button>
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Posted {job.postedAt ? formatDistanceToNow(new Date(job.postedAt)) : 'recently'} ago
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
