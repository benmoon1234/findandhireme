import { useState } from "react";
import { useLocation } from "wouter";
import { Briefcase, Github, Mail, Lock, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"JOB_SEEKER" | "EMPLOYER">("JOB_SEEKER");
  
  const { login, register, isLoggingIn, isRegistering } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login({ email, password });
        setLocation("/dashboard");
      } else {
        await register({ email, password, name, role });
        setLocation(role === 'EMPLOYER' ? '/employer/dashboard' : '/dashboard');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 text-primary cursor-pointer" onClick={() => setLocation("/")}>
            <Briefcase className="w-10 h-10" />
            <span className="font-display font-bold text-2xl text-foreground">Find & Hire Me</span>
          </div>
        </div>

        <div className="bg-card rounded-3xl shadow-xl shadow-black/5 border border-border p-8 animate-slide-up">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">{isLogin ? 'Welcome back' : 'Create an account'}</h1>
            <p className="text-muted-foreground mt-2">
              {isLogin ? 'Enter your details to access your account.' : 'Join the platform to find your next opportunity.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1.5">I want to...</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className={`p-3 rounded-xl border text-sm font-semibold transition-all ${role === 'JOB_SEEKER' ? 'bg-primary/10 border-primary text-primary' : 'bg-transparent border-border text-muted-foreground hover:bg-muted'}`}
                      onClick={() => setRole("JOB_SEEKER")}
                    >
                      Find a Job
                    </button>
                    <button
                      type="button"
                      className={`p-3 rounded-xl border text-sm font-semibold transition-all ${role === 'EMPLOYER' ? 'bg-primary/10 border-primary text-primary' : 'bg-transparent border-border text-muted-foreground hover:bg-muted'}`}
                      onClick={() => setRole("EMPLOYER")}
                    >
                      Hire Talent
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
                      placeholder="John Doe" 
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
                  placeholder="name@example.com" 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium">Password</label>
                {isLogin && <a href="#" className="text-xs text-primary font-medium hover:underline">Forgot password?</a>}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoggingIn || isRegistering}
              className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none"
            >
              {isLogin ? (isLoggingIn ? 'Signing in...' : 'Sign In') : (isRegistering ? 'Creating account...' : 'Create Account')}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-bold hover:underline">
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
