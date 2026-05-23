import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Layers, Palette, Eye, ArrowRight } from 'lucide-react';

const Github = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-grid-pattern flex flex-col relative overflow-hidden">
      {/* Background radial gradients for ambient glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/10 blur-[120px] pointer-events-none"></div>

      {/* Header / Navbar */}
      <header className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-violet-600 to-indigo-500 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-6 w-6 animate-pulse-slow" />
          </div>
          <span className="font-display font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
            Portfolio<span className="text-indigo-400 font-semibold text-xl">Maker</span>
          </span>
        </div>

        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/25 transition-all glow-btn"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-slate-300 hover:text-white font-medium transition-colors">
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/25 transition-all glow-btn"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 relative z-10 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-sm font-medium mb-8 animate-float">
          <Sparkles className="h-4 w-4" />
          <span>The Next Generation Portfolio Builder</span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight mb-6">
          Showcase Your Work With{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
            Stunning Elegance
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed mb-12">
          Create premium, highly interactive portfolio websites in minutes. Zero coding required. Choose elegant
          templates, customize themes, and export or host your unique profile instantly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
          <Link
            to={isAuthenticated ? "/dashboard" : "/register"}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all glow-btn"
          >
            Create Your Portfolio
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="https://github.com/deepikamishra25/PortfolioMaker"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-200 font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Github className="h-5 w-5" />
            GitHub Repo
          </a>
        </div>

        {/* Feature Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-24 text-left">
          <div className="glass-card p-8 rounded-2xl">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl w-fit mb-6">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-2">Modular Blocks</h3>
            <p className="text-slate-400 leading-relaxed">
              Easily manage sections like About Me, Projects, Experience, Skills, and custom modules with absolute flexibility.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl">
            <div className="p-3 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-xl w-fit mb-6">
              <Palette className="h-6 w-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-2">Beautiful Themes</h3>
            <p className="text-slate-400 leading-relaxed">
              Tailor primary and accent colors, backgrounds, layout spacing, and fonts dynamically to fit your personal brand.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl w-fit mb-6">
              <Eye className="h-6 w-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-2">Instant Preview</h3>
            <p className="text-slate-400 leading-relaxed">
              Interact with your live responsive portfolio dashboard view instantly as you modify details or toggle themes.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 text-sm border-t border-white/5 relative z-10">
        <p>&copy; {new Date().getFullYear()} Portfolio Maker. Built for creators and developers.</p>
      </footer>
    </div>
  );
};

export default Home;
