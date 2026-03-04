import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JobCard } from "@/components/jobs/JobCard";
import { useJobs } from "@/hooks/use-jobs";
import { Search, MapPin, Filter, Map } from "lucide-react";

export default function Jobs() {
  const { data: jobs, isLoading } = useJobs();
  const [view, setView] = useState<'list' | 'map'>('list');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header & Search */}
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold mb-6">Explore Jobs</h1>
            
            <div className="bg-card p-2 rounded-2xl shadow-md border border-border flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center px-4 bg-muted/30 rounded-xl">
                <Search className="w-5 h-5 text-muted-foreground mr-3" />
                <input type="text" placeholder="Job title, keywords..." className="w-full bg-transparent border-none focus:outline-none py-3 text-foreground" />
              </div>
              <div className="flex-1 flex items-center px-4 bg-muted/30 rounded-xl">
                <MapPin className="w-5 h-5 text-muted-foreground mr-3" />
                <input type="text" placeholder="Location" className="w-full bg-transparent border-none focus:outline-none py-3 text-foreground" />
              </div>
              <select className="bg-muted/30 border-none rounded-xl px-4 py-3 focus:outline-none text-foreground font-medium">
                <option value="ALL">All Countries</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="NG">Nigeria</option>
                <option value="REMOTE">Remote</option>
              </select>
              <button className="bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-xl hover:bg-primary/90 transition-colors">
                Search
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-64 flex-shrink-0 space-y-6 hidden md:block">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2"><Filter className="w-4 h-4"/> Filters</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Employment Type</h4>
                    <div className="space-y-2">
                      {['Full-Time', 'Part-Time', 'Contract', 'Freelance'].map(t => (
                        <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                          {t}
                        </label>
                      ))}
                    </div>
                  </div>
                  <hr className="border-border" />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Experience Level</h4>
                    <div className="space-y-2">
                      {['Entry Level', 'Mid Level', 'Senior', 'Executive'].map(t => (
                        <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                          {t}
                        </label>
                      ))}
                    </div>
                  </div>
                  <hr className="border-border" />
                  <div>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm font-medium text-foreground">Remote Only</span>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-border checked:border-primary checked:right-0"/>
                        <label htmlFor="toggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-muted cursor-pointer"></label>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </aside>

            {/* Results Area */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground text-sm">Showing <span className="font-semibold text-foreground">{jobs?.length || 0}</span> jobs</p>
                <div className="flex items-center gap-4 text-sm">
                  <select className="border-none bg-transparent font-medium cursor-pointer focus:outline-none">
                    <option>Most Relevant</option>
                    <option>Most Recent</option>
                    <option>Salary: High to Low</option>
                  </select>
                  <div className="flex items-center bg-muted rounded-lg p-1">
                    <button onClick={() => setView('list')} className={`p-1.5 rounded-md ${view === 'list' ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}>List</button>
                    <button onClick={() => setView('map')} className={`p-1.5 rounded-md flex items-center gap-1 ${view === 'map' ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}><Map className="w-4 h-4"/> Map</button>
                  </div>
                </div>
              </div>

              {view === 'list' ? (
                <div className="space-y-4">
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => <div key={i} className="h-40 bg-card rounded-2xl animate-pulse border border-border"></div>)
                  ) : jobs?.length ? (
                    jobs.map(job => <JobCard key={job.id} job={job} />)
                  ) : (
                    <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
                      <h3 className="text-lg font-bold">No jobs found</h3>
                      <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-card rounded-2xl border border-border h-[600px] flex items-center justify-center bg-slate-50">
                   {/* Placeholder for Mapbox View */}
                   <div className="text-center text-muted-foreground">
                      <Map className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium text-lg text-foreground">Map View Placeholder</p>
                      <p className="text-sm">Interactive map will render here with location pins.</p>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
