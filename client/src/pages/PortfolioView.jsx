import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, ExternalLink, AlertCircle, ArrowLeft, Terminal, User } from 'lucide-react';

const Github = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Twitter = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const PortfolioView = () => {
  const { slug } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        // Fetch via custom slug from public API
        // Direct URL call avoids auth header errors for non-logged-in users
        const res = await axios.get(`/api/portfolios/slug/${slug}`);
        setPortfolio(res.data);
      } catch (err) {
        console.error(err);
        setError('Portfolio not found or failed to load. Check the URL slug.');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-indigo-500">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full glass-panel p-8 rounded-3xl text-center border border-white/5">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">Unavailable</h2>
          <p className="text-slate-400 text-sm mb-6">{error || 'This portfolio does not exist.'}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const { theme, about, skills, projects, experience, template } = portfolio;
  
  // Custom Styles
  const primaryColor = theme?.primaryColor || '#6366f1';
  const secondaryColor = theme?.secondaryColor || '#10b981';

  // Social icons helper
  const renderSocialIcon = (platform, url) => {
    if (!url) return null;
    const icons = {
      github: <Github className="h-5 w-5" />,
      linkedin: <Linkedin className="h-5 w-5" />,
      twitter: <Twitter className="h-5 w-5" />,
      email: <Mail className="h-5 w-5" />,
    };
    const href = platform === 'email' && !url.startsWith('mailto:') ? `mailto:${url}` : url;
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        key={platform}
        className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-115 text-slate-300 hover:text-white transition-all"
      >
        {icons[platform]}
      </a>
    );
  };

  // ============================================
  // TEMPLATE 1: MODERN DARK (GLASSMORPHIC)
  // ============================================
  const renderModernTemplate = () => (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: theme.backgroundColor || '#0f172a', color: theme.textColor || '#f8fafc' }}
    >
      {/* Background ambient light balls */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] pointer-events-none opacity-30"
        style={{ backgroundColor: primaryColor }}
      ></div>
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] pointer-events-none opacity-20"
        style={{ backgroundColor: secondaryColor }}
      ></div>

      <div className="max-w-5xl mx-auto px-6 py-16 relative z-10 space-y-20">
        {/* Nav / Banner */}
        <header className="flex justify-between items-center pb-8 border-b border-white/5">
          <span className="font-display font-black text-xl tracking-wider" style={{ color: primaryColor }}>
            {about.name ? about.name.toUpperCase() : 'PORTFOLIO'}
          </span>
          <div className="flex gap-4">
            {about.socials && Object.entries(about.socials).map(([key, val]) => renderSocialIcon(key, val))}
          </div>
        </header>

        {/* Hero */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center pt-8">
          <div className="md:col-span-2 space-y-6">
            <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Hi, I'm <span style={{ color: primaryColor }}>{about.name}</span>
            </h1>
            <p className="text-xl md:text-2xl font-semibold opacity-80" style={{ color: secondaryColor }}>
              {about.role}
            </p>
            <p className="text-lg opacity-70 leading-relaxed max-w-xl">{about.bio}</p>
          </div>
          <div className="flex justify-center md:justify-end">
            {about.avatar ? (
              <img
                src={about.avatar}
                alt={about.name}
                className="w-56 h-56 rounded-3xl object-cover shadow-2xl border-2"
                style={{ borderColor: primaryColor }}
              />
            ) : (
              <div className="w-56 h-56 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                <User className="h-20 w-20 opacity-30" />
              </div>
            )}
          </div>
        </section>

        {/* Skills */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold border-b border-white/5 pb-3">Core Expertise</h2>
          <div className="flex flex-wrap gap-3">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all hover:scale-105"
                style={{
                  backgroundColor: `${primaryColor}10`,
                  borderColor: `${primaryColor}20`,
                  color: primaryColor,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold border-b border-white/5 pb-3">Featured Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project, index) => (
              <div key={index} className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold text-xl mb-2">{project.title}</h3>
                  <p className="text-sm opacity-70 leading-relaxed mb-6">{project.description}</p>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {project.techStack?.map((stack, sIdx) => (
                      <span key={sIdx} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] opacity-75 font-mono">
                        {stack}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-4 pt-2">
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold flex items-center gap-1 hover:underline"
                        style={{ color: primaryColor }}
                      >
                        Live Demo <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold flex items-center gap-1 opacity-70 hover:opacity-100 hover:underline"
                      >
                        GitHub <Github className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Experience */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold border-b border-white/5 pb-3">Professional Milestones</h2>
          <div className="space-y-6 relative border-l border-white/5 ml-4 pl-6">
            {experience.map((exp, index) => (
              <div key={index} className="relative group">
                <div
                  className="w-3.5 h-3.5 rounded-full absolute left-[-31.5px] top-1.5 border-4 border-slate-950 transition-colors"
                  style={{ backgroundColor: primaryColor }}
                ></div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-lg">{exp.role}</h3>
                  <div className="flex gap-2 text-sm font-semibold" style={{ color: secondaryColor }}>
                    <span>{exp.company}</span>
                    <span>&bull;</span>
                    <span>
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <p className="text-sm opacity-70 leading-relaxed pt-1 max-w-2xl">{exp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );

  // ============================================
  // TEMPLATE 2: MINIMALIST LIGHT
  // ============================================
  const renderMinimalTemplate = () => (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 selection:bg-neutral-900 selection:text-white">
      <div className="max-w-3xl mx-auto px-6 py-24 space-y-20 font-sans">
        {/* Header */}
        <header className="flex justify-between items-center pb-8 border-b border-neutral-200">
          <span className="font-display font-bold text-lg tracking-wider text-neutral-800">
            {about.name}
          </span>
          <div className="flex gap-4">
            {about.socials?.email && (
              <a href={`mailto:${about.socials.email}`} className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-medium">
                Email
              </a>
            )}
            {about.socials?.github && (
              <a href={about.socials.github} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-medium">
                GitHub
              </a>
            )}
            {about.socials?.linkedin && (
              <a href={about.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-medium">
                LinkedIn
              </a>
            )}
          </div>
        </header>

        {/* Hero */}
        <section className="space-y-6">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-neutral-950 leading-tight">
            {about.role}
          </h1>
          <p className="text-lg text-neutral-600 leading-relaxed max-w-xl">{about.bio}</p>
        </section>

        {/* Skills */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Expertise</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span key={index} className="px-3 py-1 rounded bg-neutral-200/60 text-xs font-medium text-neutral-800">
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Projects</h2>
          <div className="divide-y divide-neutral-200">
            {projects.map((project, index) => (
              <div key={index} className="py-6 flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1 md:max-w-md">
                  <h3 className="font-display font-bold text-lg text-neutral-950">{project.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{project.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-neutral-900 underline underline-offset-4 hover:text-neutral-600"
                    >
                      Demo <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900"
                    >
                      Source
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Experience */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Experience</h2>
          <div className="space-y-8">
            {experience.map((exp, index) => (
              <div key={index} className="flex justify-between items-start flex-col sm:flex-row gap-2">
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-base text-neutral-950">{exp.role}</h3>
                  <p className="text-sm font-semibold text-neutral-600">{exp.company}</p>
                  <p className="text-sm text-neutral-500 leading-relaxed max-w-lg">{exp.description}</p>
                </div>
                <span className="text-xs font-medium text-neutral-400 shrink-0">
                  {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );

  // ============================================
  // TEMPLATE 3: CYBERPUNK/CREATIVE
  // ============================================
  const renderCreativeTemplate = () => (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans border-t-4 border-rose-500">
      <div className="max-w-5xl mx-auto px-6 py-20 space-y-24">
        {/* Header */}
        <header className="flex justify-between items-center border-b border-rose-500/20 pb-6">
          <span className="font-display text-2xl font-black italic tracking-tighter text-rose-500">
            {about.name ? about.name.toUpperCase() : 'PORTFOLIO'}_
          </span>
          <div className="flex gap-4">
            {about.socials && Object.entries(about.socials).map(([key, val]) => renderSocialIcon(key, val))}
          </div>
        </header>

        {/* Hero */}
        <section className="space-y-6 text-center max-w-3xl mx-auto relative py-12">
          {/* Neon Glow backgrounds */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-rose-500/10 blur-[80px] pointer-events-none"></div>

          <div className="inline-flex px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold tracking-widest uppercase mb-4">
            System status: online
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
            I am <span className="bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">{about.name}</span>
          </h1>
          <p className="text-lg md:text-2xl font-bold tracking-wider text-indigo-400 uppercase font-mono">
            // {about.role}
          </p>
          <p className="text-base text-slate-400 max-w-xl mx-auto leading-relaxed border border-white/5 p-6 bg-slate-900/40 backdrop-blur-md">
            {about.bio}
          </p>
        </section>

        {/* Skills */}
        <section className="p-8 border border-white/5 bg-slate-900/30 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 px-4 py-1.5 bg-rose-500/10 border-l border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-rose-400 font-mono">
            Skills Database
          </div>
          <h2 className="font-display text-xl font-bold uppercase tracking-wider mb-6 text-slate-200">Capabilities</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-slate-950 border border-rose-500/30 text-rose-400 font-mono text-xs font-semibold hover:bg-rose-500 hover:text-white transition-all cursor-default"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section className="space-y-6">
          <h2 className="font-display text-xl font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            Operational Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <div
                key={index}
                className="p-6 border border-white/5 bg-slate-900/20 hover:border-rose-500/30 transition-all rounded-3xl group flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-display font-bold text-xl text-white mb-2 group-hover:text-rose-400 transition-colors uppercase">
                    {project.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">{project.description}</p>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {project.techStack?.map((stack, sIdx) => (
                      <span key={sIdx} className="px-2 py-0.5 bg-slate-950 border border-white/5 text-[10px] font-mono text-slate-400">
                        {stack}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-4 pt-2 font-mono text-xs">
                    {project.link && (
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-rose-500 font-bold hover:underline">
                        RUN_DEMO
                      </a>
                    )}
                    {project.github && (
                      <a href={project.github} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">
                        SRC_CODE
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Experience */}
        <section className="space-y-6">
          <h2 className="font-display text-xl font-bold uppercase tracking-wider text-slate-200">Timeline logs</h2>
          <div className="space-y-8">
            {experience.map((exp, index) => (
              <div key={index} className="p-6 border border-white/5 bg-slate-900/10 rounded-2xl flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-lg uppercase text-rose-500">{exp.role}</h3>
                  <p className="text-sm font-semibold font-mono text-slate-300">Company: {exp.company}</p>
                  <p className="text-sm text-slate-400 leading-relaxed pt-2 max-w-xl">{exp.description}</p>
                </div>
                <span className="text-xs font-mono font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400 px-3 py-1 rounded w-fit h-fit self-start">
                  {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );

  // ============================================
  // TEMPLATE 4: DEVELOPER (TERMINAL/CONSOLE)
  // ============================================
  const renderDeveloperTemplate = () => (
    <div className="min-h-screen bg-black text-emerald-500 font-mono p-6 selection:bg-emerald-500 selection:text-black">
      <div className="max-w-4xl mx-auto border border-emerald-950 bg-neutral-950/80 rounded-xl shadow-2xl shadow-emerald-950/15 overflow-hidden">
        {/* Terminal Header */}
        <div className="bg-neutral-900 px-6 py-3 border-b border-emerald-950 flex items-center justify-between">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-600"></div>
            <div className="w-3 h-3 rounded-full bg-amber-600"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
          </div>
          <span className="text-xs text-emerald-800 font-semibold uppercase tracking-widest flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            console@{slug}
          </span>
        </div>

        {/* Terminal Contents */}
        <div className="p-8 space-y-12">
          {/* Welcome mock commands */}
          <div className="space-y-2">
            <p className="text-emerald-800">Microsoft Windows [Version 10.0.22631]</p>
            <p className="text-emerald-800">(c) Microsoft Corporation. All rights reserved.</p>
            <br />
            <p className="text-emerald-300">C:\Users\{slug}&gt; <span className="text-white">whoami</span></p>
            <div className="pl-4 space-y-2 pt-1">
              <h1 className="text-2xl font-bold text-white">{about.name}</h1>
              <p className="text-base text-emerald-400">&gt; Job Title: {about.role}</p>
              <p className="text-sm opacity-90 leading-relaxed text-emerald-500/80 max-w-2xl">{about.bio}</p>
            </div>
          </div>

          {/* Socials command */}
          <div className="space-y-3">
            <p className="text-emerald-300">C:\Users\{slug}&gt; <span className="text-white">cat socials.json</span></p>
            <div className="pl-4 font-mono text-sm space-y-1">
              {about.socials?.email && <p>&quot;email&quot;: &quot;<a href={`mailto:${about.socials.email}`} className="underline hover:text-white">{about.socials.email}</a>&quot;,</p>}
              {about.socials?.github && <p>&quot;github&quot;: &quot;<a href={about.socials.github} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">{about.socials.github}</a>&quot;,</p>}
              {about.socials?.linkedin && <p>&quot;linkedin&quot;: &quot;<a href={about.socials.linkedin} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">{about.socials.linkedin}</a>&quot;,</p>}
            </div>
          </div>

          {/* Skills command */}
          <div className="space-y-4">
            <p className="text-emerald-300">C:\Users\{slug}&gt; <span className="text-white">get-skills --verbose</span></p>
            <div className="pl-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {skills.map((skill, index) => (
                <div key={index} className="px-3 py-1 bg-emerald-950/20 border border-emerald-800/40 text-xs text-center text-emerald-400">
                  [x] {skill}
                </div>
              ))}
            </div>
          </div>

          {/* Projects command */}
          <div className="space-y-6">
            <p className="text-emerald-300">C:\Users\{slug}&gt; <span className="text-white">ls projects/</span></p>
            <div className="pl-4 space-y-6">
              {projects.map((project, index) => (
                <div key={index} className="p-4 border border-emerald-900 bg-black/60 space-y-2">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="font-bold text-white text-base"># {project.title}</span>
                    <div className="flex gap-4 text-xs font-semibold">
                      {project.link && (
                        <a href={project.link} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                          [Run Program]
                        </a>
                      )}
                      {project.github && (
                        <a href={project.github} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                          [Source]
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-xs opacity-75">{project.description}</p>
                  <p className="text-xs text-emerald-700">Tech Stack: {project.techStack?.join(', ')}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Experience command */}
          <div className="space-y-6">
            <p className="text-emerald-300">C:\Users\{slug}&gt; <span className="text-white">cat history_logs.csv</span></p>
            <div className="pl-4 font-mono text-xs overflow-x-auto space-y-3">
              <div className="border-b border-emerald-950 pb-2 hidden sm:grid grid-cols-4 gap-2 font-bold text-white">
                <span>ROLE</span>
                <span>COMPANY</span>
                <span>DURATION</span>
                <span>SUMMARY</span>
              </div>
              {experience.map((exp, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-2 py-1 opacity-90 border-b border-emerald-950/20 last:border-b-0">
                  <span className="font-bold text-white sm:text-emerald-400">{exp.role}</span>
                  <span>{exp.company}</span>
                  <span>
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </span>
                  <span className="opacity-75 sm:line-clamp-2">{exp.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Template switch
  switch (template) {
    case 'minimal':
      return renderMinimalTemplate();
    case 'creative':
      return renderCreativeTemplate();
    case 'developer':
      return renderDeveloperTemplate();
    case 'modern':
    default:
      return renderModernTemplate();
  }
};

export default PortfolioView;
