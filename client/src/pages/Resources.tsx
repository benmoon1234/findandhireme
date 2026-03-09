import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { usePageMeta } from "@/hooks/use-page-meta";
import { Calendar, ArrowRight, BookOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Resources() {
  usePageMeta("Career Resources");
  const { data: posts, isLoading } = useQuery<any[]>({
    queryKey: ["/api/blog-posts"],
    queryFn: async () => {
      const res = await fetch("/api/blog-posts");
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });

  const categories = [...new Set(posts?.map(p => p.category).filter(Boolean) || [])];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 data-testid="text-resources-title" className="text-4xl font-display font-bold mb-4">Career Resources</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Expert advice, industry insights, and practical guides to help you land your dream job.
            </p>
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              <span className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium cursor-pointer">All</span>
              {categories.map(cat => (
                <span key={cat} className="px-4 py-2 rounded-full border border-border text-sm font-medium cursor-pointer hover:border-primary/50 hover:text-primary transition-all">
                  {cat}
                </span>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-72 bg-card rounded-2xl animate-pulse border border-border" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts?.map(post => (
                <Link key={post.id} href={`/resources/${post.slug}`}>
                  <article data-testid={`card-blog-${post.id}`} className="bg-card rounded-2xl border border-border hover-elevate cursor-pointer h-full flex flex-col">
                    <div className="h-40 bg-gradient-to-br from-primary/10 via-accent/5 to-muted rounded-t-2xl flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-primary/30" />
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      {post.category && (
                        <span className="text-xs font-semibold text-primary mb-2">{post.category}</span>
                      )}
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">{post.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">{post.excerpt}</p>
                      <div className="flex justify-between items-center text-xs text-muted-foreground pt-4 border-t border-border">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {post.publishedAt ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true }) : "Recently"}
                        </span>
                        <span className="text-primary font-semibold flex items-center gap-1">
                          Read More <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </article>
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
