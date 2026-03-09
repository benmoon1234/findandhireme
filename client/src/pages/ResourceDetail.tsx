import { useRoute, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ResourceDetail() {
  const [, params] = useRoute("/resources/:slug");
  const slug = params?.slug || "";

  const { data: post, isLoading } = useQuery<any>({
    queryKey: ["/api/blog-posts", slug],
    queryFn: async () => {
      const res = await fetch(`/api/blog-posts/${slug}`);
      if (!res.ok) throw new Error("Post not found");
      return res.json();
    },
    enabled: !!slug,
  });

  usePageMeta(post ? post.title : "Article");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 pt-32 text-center">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 pt-32 text-center text-xl">Article not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/resources" className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-8 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Resources
          </Link>

          <article>
            {post.category && (
              <span className="text-sm font-semibold text-primary mb-4 inline-block">{post.category}</span>
            )}
            <h1 data-testid="text-post-title" className="text-4xl font-display font-bold mb-4 leading-tight">{post.title}</h1>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
              <span className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-3 h-3 text-primary" />
                </div>
                Find & Hire Me Team
              </span>
              {post.publishedAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
                </span>
              )}
            </div>

            <div className="prose prose-lg max-w-none text-foreground/80 leading-relaxed">
              {post.content.split('\n').map((paragraph: string, i: number) => {
                if (paragraph.startsWith('## ')) {
                  return <h2 key={i} className="text-2xl font-bold text-foreground mt-8 mb-4">{paragraph.replace('## ', '')}</h2>;
                }
                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                  return <p key={i} className="font-semibold text-foreground">{paragraph.replace(/\*\*/g, '')}</p>;
                }
                if (paragraph.startsWith('- ')) {
                  return <li key={i} className="ml-4">{paragraph.replace('- ', '')}</li>;
                }
                if (paragraph.trim() === '') return <br key={i} />;
                return <p key={i} className="mb-4">{paragraph}</p>;
              })}
            </div>
          </article>

          <div className="mt-16 bg-card rounded-2xl border border-border p-8 text-center">
            <h3 className="text-xl font-bold mb-3">Ready to find your next opportunity?</h3>
            <p className="text-muted-foreground mb-6">Browse thousands of jobs across the US, UK, Nigeria, and beyond.</p>
            <Link href="/jobs" data-testid="link-search-jobs-cta" className="inline-block bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-xl hover:bg-primary/90 transition-colors">
              Search Jobs Now
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
