import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ProfileForm from './ProfileForm.jsx';
import {
  Sparkles,
  Plus,
  ExternalLink,
  Edit,
  Trash2,
  LogOut,
  User,
  Folder,
  Eye,
  TrendingUp,
  Download,
  Award,
  Briefcase,
  GraduationCap,
  Palette,
  Settings,
  Activity,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Tablet,
  Smartphone,
  CheckCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('analytics'); // analytics, profile, skills, projects, experience, education, themes, settings
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // desktop, tablet, mobile
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Stats Counters (Simulating stats)
  const viewsCount = 1420;
  const completionRate = 85;
  const visitorCount = 428;
  const downloadsCount = 37;

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const res = await api.get('/portfolios');
        setPortfolios(res.data);
        if (res.data.length > 0) {
          setSelectedPortfolio(res.data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolios();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this portfolio? This cannot be undone.')) {
      try {
        await api.delete(`/portfolios/${id}`);
        const updated = portfolios.filter((p) => p._id !== id);
        setPortfolios(updated);
        if (selectedPortfolio?._id === id) {
          setSelectedPortfolio(updated[0] || null);
        }
      } catch (err) {
        console.error(err);
        alert('Failed to delete portfolio.');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Sidebar Menu Config
  const menuItems = [
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'skills', label: 'Skills', icon: Award },
    { id: 'projects', label: 'Projects', icon: Folder },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'themes', label: 'Themes', icon: Palette },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-pink-500">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden font-sans relative">
      {/* Cinematic Glowing Background blobs */}
      <motion.div
        animate={{
          x: [0, 40, 0],
          y: [0, -30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 10,
          ease: 'easeInOut',
        }}
        className="absolute top-[-10%] left-[-15%] w-[500px] h-[500px] rounded-full bg-pink-500/10 blur-[150px] pointer-events-none z-0"
      ></motion.div>

      <motion.div
        animate={{
          x: [0, -50, 0],
          y: [0, 40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 12,
          ease: 'easeInOut',
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/15 blur-[160px] pointer-events-none z-0"
      ></motion.div>

      {/* Background anti-gravity grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0"></div>

      {/* Floating 3D Sparkle decorations */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 360] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
        className="absolute top-[20%] right-[30%] text-pink-500/30 pointer-events-none z-0 hidden lg:block"
      >
        <Sparkles className="h-10 w-10" />
      </motion.div>

      {/* ============================================================== */}
      {/* 1. SIDEBAR (GLASSMORPHIC & COLLAPSABLE) */}
      {/* ============================================================== */}
      <motion.aside
        animate={{ width: sidebarExpanded ? 260 : 80 }}
        transition={{ duration: 0.4, cubicBezier: [0.4, 0, 0.2, 1] }}
        className="glass-panel border-r border-white/5 relative z-20 hidden md:flex flex-col justify-between shrink-0 h-screen m-4 rounded-3xl"
        style={{ background: 'rgba(9, 13, 22, 0.7)' }}
      >
        <div>
          {/* Logo / Header */}
          <div className="p-6 flex items-center justify-between">
            <AnimatePresence mode="wait">
              {sidebarExpanded ? (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2"
                >
                  <div className="bg-gradient-to-tr from-pink-500 to-purple-600 p-2 rounded-xl text-white shadow-lg shadow-pink-500/20">
                    <Sparkles className="h-5 w-5 animate-pulse-slow" />
                  </div>
                  <span className="font-display font-extrabold text-xl tracking-tight text-white">
                    Portfolio<span className="text-pink-400 font-semibold text-lg">Maker</span>
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-gradient-to-tr from-pink-500 to-purple-600 p-2 rounded-xl text-white mx-auto"
                >
                  <Sparkles className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toggle collapse */}
            {sidebarExpanded && (
              <button
                onClick={() => setSidebarExpanded(false)}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
          </div>

          {!sidebarExpanded && (
            <div className="flex justify-center pb-4">
              <button
                onClick={() => setSidebarExpanded(true)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* User Account Capsule in Sidebar */}
          {sidebarExpanded && (
            <div className="px-6 py-4 border-t border-b border-white/5 bg-white/5 my-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-slate-800 border border-pink-500/40 flex items-center justify-center text-white">
                    <User className="h-5 w-5" />
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-slate-950"></span>
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-bold text-white truncate">{user?.username || 'Creator'}</h4>
                  <p className="text-xs text-pink-400 font-mono tracking-wider">CREATOR_MODE</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="px-4 py-6 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveMenu(item.id);
                    if (item.id === 'projects') {
                      navigate(selectedPortfolio ? `/editor/${selectedPortfolio._id}` : '/editor');
                    }
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all relative ${
                    isActive
                      ? 'text-pink-400 bg-gradient-to-r from-pink-500/10 to-purple-600/5 border border-pink-500/15'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-pink-500' : 'text-slate-400'}`} />
                  {sidebarExpanded && <span className="truncate">{item.label}</span>}
                  {isActive && sidebarExpanded && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-pink-500 shadow-md shadow-pink-500"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer logout */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 transition-colors font-semibold text-sm"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {sidebarExpanded && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* ============================================================== */}
      {/* 2. MAIN HUB SPACE */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10 m-4 ml-0 md:ml-0">
        {/* TOP NAVBAR (FLOATING GLASSBOARD) */}
        <header
          className="glass-panel px-6 py-4 flex items-center justify-between border border-white/5 rounded-2xl mb-6 shrink-0"
          style={{ background: 'rgba(9, 13, 22, 0.7)' }}
        >
          {/* Search bar */}
          <div className="relative w-64 hidden sm:block">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search portfolios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:bg-slate-900 transition-all"
            />
          </div>

          <div className="flex items-center gap-4 ml-auto sm:ml-0">
            {/* Quick portfolio selector dropdown */}
            {portfolios.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider hidden md:block">Active Project:</span>
                <select
                  value={selectedPortfolio?._id || ''}
                  onChange={(e) => {
                    const found = portfolios.find((p) => p._id === e.target.value);
                    if (found) setSelectedPortfolio(found);
                  }}
                  className="bg-slate-900/60 border border-white/10 text-white rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:border-pink-500 font-semibold"
                >
                  {portfolios.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors relative"
              >
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-pink-500 shadow-sm shadow-pink-500"></span>
              </button>

              {/* Mock notification drop */}
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-80 glass-panel p-4 rounded-2xl border border-white/10 bg-slate-950 shadow-2xl z-50 space-y-3"
                  >
                    <h4 className="font-display font-bold text-sm border-b border-white/5 pb-2 text-white flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-pink-500" />
                      Live Feed
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 space-y-1">
                        <p className="text-slate-300 font-semibold">Stunning portfolio build finished</p>
                        <p className="text-slate-500 font-mono">1 minute ago</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 space-y-1">
                        <p className="text-slate-300 font-semibold">MongoDB Atlas online</p>
                        <p className="text-slate-500 font-mono">10 minutes ago</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CTA action button */}
            <Link
              to="/editor"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-pink-500/20 transition-all glow-btn"
            >
              <Plus className="h-4.5 w-4.5" />
              Build New Portfolio
            </Link>
          </div>
        </header>

        {/* ============================================================== */}
        {/* 3. SCROLLABLE WORKING SPACE */}
        {/* ============================================================== */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {/* PROFILE FORM — shown when activeMenu === 'profile' */}
          {activeMenu === 'profile' ? (
            <ProfileForm />
          ) : (
            <>
          {/* USER GREETING BANNER */}
          <div className="relative p-8 rounded-3xl overflow-hidden glass-panel border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Visual gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/5 to-transparent pointer-events-none"></div>

            <div className="space-y-2 relative z-10 text-center md:text-left">
              <span className="text-xs text-pink-400 font-mono font-bold tracking-widest uppercase">
                // CREATOR PLATFORM RUNNING SUCCESSFULLY
              </span>
              <h2 className="font-display text-3xl font-extrabold text-white leading-tight">
                Hey {user?.username || 'Creator'}, let's build something <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">legendary</span>.
              </h2>
              <p className="text-slate-400 text-sm max-w-lg">
                Manage views, custom colors, active layouts, and analyze interactions from your futuristic central command.
              </p>
            </div>

            <div className="flex gap-4 relative z-10">
              <Link
                to={selectedPortfolio ? `/editor/${selectedPortfolio._id}` : '/editor'}
                className="px-5 py-3 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-white font-semibold text-xs transition-all flex items-center gap-1.5"
              >
                <Edit className="h-4 w-4" />
                Launch Builder
              </Link>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 4. PREMIUM GLOWING DASHBOARD CARDS (GRID) */}
          {/* ============================================================== */}
          <section className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              {
                id: 'views',
                label: 'Portfolio Views',
                value: viewsCount,
                sub: '+12% this week',
                icon: Eye,
                color: 'from-pink-500 to-rose-500',
              },
              {
                id: 'completion',
                label: 'Profile Score',
                value: `${completionRate}%`,
                sub: 'Ready for display',
                icon: CheckCircle,
                color: 'from-purple-500 to-indigo-500',
              },
              {
                id: 'visitors',
                label: 'Unique Visitors',
                value: visitorCount,
                sub: 'Active tracking',
                icon: TrendingUp,
                color: 'from-emerald-500 to-teal-500',
              },
              {
                id: 'projects',
                label: 'Live Projects',
                value: selectedPortfolio?.projects?.length || 0,
                sub: 'Linked schemas',
                icon: Folder,
                color: 'from-blue-500 to-cyan-500',
              },
              {
                id: 'downloads',
                label: 'Resume DLs',
                value: downloadsCount,
                sub: 'Active recruitment',
                icon: Download,
                color: 'from-amber-500 to-orange-500',
              },
              {
                id: 'skills',
                label: 'Core Skills',
                value: selectedPortfolio?.skills?.length || 0,
                sub: 'Parsed tags',
                icon: Award,
                color: 'from-indigo-500 to-purple-500',
              },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{
                    y: -6,
                    scale: 1.03,
                    rotateX: 1,
                    rotateY: 1,
                    boxShadow: '0 15px 30px -10px rgba(236,72,153,0.25)',
                  }}
                  className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between h-40 relative overflow-hidden group cursor-default"
                >
                  {/* Decorative glowing back light */}
                  <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-pink-500/5 group-hover:bg-pink-500/10 blur-xl pointer-events-none transition-all"></div>

                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{card.label}</span>
                    <div className={`p-2 bg-gradient-to-tr ${card.color} opacity-20 group-hover:opacity-40 rounded-lg text-white transition-opacity`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-display font-extrabold text-2xl text-white group-hover:text-pink-400 transition-colors">
                      {card.value}
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-500 tracking-wide">{card.sub}</p>
                  </div>
                </motion.div>
              );
            })}
          </section>

          {/* ============================================================== */}
          {/* 5. INTERACTIVE SPLIT: PREVIEW ORB & REAL-TIME ANALYTICS */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT 2 COLS: MOCK PREVIEW SECTION */}
            <div className="lg:col-span-2 flex flex-col space-y-4">
              <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col h-[500px]">
                {/* Header controls */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-pink-500 animate-ping"></div>
                    <span className="font-display font-bold text-base text-white">Live Workspace Preview</span>
                  </div>

                  {/* Responsive viewport controllers */}
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-white/5">
                    {[
                      { id: 'desktop', icon: Monitor },
                      { id: 'tablet', icon: Tablet },
                      { id: 'mobile', icon: Smartphone },
                    ].map((dev) => {
                      const DevIcon = dev.icon;
                      return (
                        <button
                          key={dev.id}
                          onClick={() => setPreviewDevice(dev.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            previewDevice === dev.id ? 'bg-pink-600 text-white' : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <DevIcon className="h-4 w-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* The Floating Device Mockup Wrapper */}
                <div className="flex-1 flex items-center justify-center p-4 bg-slate-950/40 rounded-2xl border border-white/5 relative overflow-hidden">
                  {selectedPortfolio ? (
                    <motion.div
                      animate={{
                        width: previewDevice === 'desktop' ? '100%' : previewDevice === 'tablet' ? '60%' : '35%',
                        height: previewDevice === 'desktop' ? '100%' : '90%',
                      }}
                      transition={{ duration: 0.4 }}
                      className="rounded-2xl border-2 border-slate-900 shadow-2xl flex flex-col overflow-hidden relative"
                      style={{
                        backgroundColor: selectedPortfolio.theme?.backgroundColor || '#0f172a',
                        color: selectedPortfolio.theme?.textColor || '#f8fafc',
                        borderColor: 'rgba(236, 72, 153, 0.3)',
                        boxShadow: '0 0 30px -10px rgba(236, 72, 153, 0.2)',
                      }}
                    >
                      {/* Browser header tab mock */}
                      <div className="bg-slate-900/60 px-4 py-2 border-b border-white/5 flex items-center justify-between text-[10px] tracking-wider shrink-0 font-mono text-slate-500">
                        <span>portfolio-maker.io/p/{selectedPortfolio.slug}</span>
                        <div className="flex gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                        </div>
                      </div>

                      {/* Mock Screen Content (Scrollable) */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left selection:bg-pink-500 selection:text-white">
                        <div className="flex items-center gap-3">
                          {selectedPortfolio.about?.avatar && (
                            <img
                              src={selectedPortfolio.about.avatar}
                              alt="Avatar"
                              className="w-10 h-10 rounded-full object-cover border"
                              style={{ borderColor: selectedPortfolio.theme?.primaryColor }}
                            />
                          )}
                          <div>
                            <h3 className="font-display font-bold text-sm leading-tight text-white">
                              {selectedPortfolio.about?.name || 'Jane Doe'}
                            </h3>
                            <p className="text-[10px] font-semibold opacity-75" style={{ color: selectedPortfolio.theme?.primaryColor }}>
                              {selectedPortfolio.about?.role || 'Developer'}
                            </p>
                          </div>
                        </div>

                        <p className="text-[10px] opacity-70 leading-relaxed font-sans">
                          {selectedPortfolio.about?.bio || 'Biography content rendering...'}
                        </p>

                        {/* Custom visual skills list */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold font-mono">Expertise</span>
                          <div className="flex flex-wrap gap-1">
                            {selectedPortfolio.skills?.slice(0, 4).map((skill, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-2 py-0.5 rounded text-[9px] border font-semibold"
                                style={{
                                  backgroundColor: `${selectedPortfolio.theme?.primaryColor}10`,
                                  borderColor: `${selectedPortfolio.theme?.primaryColor}30`,
                                  color: selectedPortfolio.theme?.primaryColor,
                                }}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Projects preview */}
                        <div className="space-y-2">
                          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold font-mono">Featured Projects</span>
                          <div className="grid grid-cols-1 gap-2">
                            {selectedPortfolio.projects?.slice(0, 1).map((proj, pIdx) => (
                              <div key={pIdx} className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                                <div className="flex justify-between items-center text-[10px] font-bold text-white">
                                  <span>{proj.title}</span>
                                  <ExternalLink className="h-3 w-3 opacity-60" />
                                </div>
                                <p className="text-[9px] opacity-70 leading-relaxed">{proj.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center text-slate-500 text-xs">
                      No active project selected. Create one to enable previews.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT 1 COL: ANTIMATTER NEON ANALYTICS CHART */}
            <div className="flex flex-col space-y-4">
              <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col h-[500px] justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                    <span className="font-display font-bold text-base text-white">Audience Growth</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-mono tracking-wider font-semibold">
                      REALTIME
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Interactive graph mapping visitors activity across your hosted portfolio schemas.
                  </p>
                </div>

                {/* High-end Neon SVG graph */}
                <div className="flex items-center justify-center p-2">
                  <svg viewBox="0 0 300 150" className="w-full h-44 overflow-visible">
                    <defs>
                      <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ec4899" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Background Grid Lines */}
                    <line x1="0" y1="30" x2="300" y2="30" stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />
                    <line x1="0" y1="75" x2="300" y2="75" stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />
                    <line x1="0" y1="120" x2="300" y2="120" stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />

                    {/* Filled Gradient Area */}
                    <path
                      d="M 0 130 C 50 110, 80 40, 120 70 C 160 100, 200 20, 250 50 C 275 65, 300 20, 300 20 L 300 150 L 0 150 Z"
                      fill="url(#glowGrad)"
                    />

                    {/* Glowing Stroke line */}
                    <path
                      d="M 0 130 C 50 110, 80 40, 120 70 C 160 100, 200 20, 250 50 C 275 65, 300 20, 300 20"
                      fill="none"
                      stroke="#ec4899"
                      strokeWidth="3.5"
                      className="drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]"
                    />

                    {/* Interactive dots with halo */}
                    <circle cx="120" cy="70" r="6" fill="#8b5cf6" className="drop-shadow-[0_0_6px_rgba(139,92,246,0.8)]" />
                    <circle cx="200" cy="30" r="6" fill="#ec4899" className="drop-shadow-[0_0_6px_rgba(236,72,153,0.8)]" />
                  </svg>
                </div>

                {/* Substats */}
                <div className="border-t border-white/5 pt-4 grid grid-cols-2 gap-4 text-center">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Avg Duration</span>
                    <h4 className="font-display font-extrabold text-base text-white">4m 32s</h4>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Bounce Rate</span>
                    <h4 className="font-display font-extrabold text-base text-pink-400">22.4%</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 6. LIST OF ALL PORTFOLIOS WITH ACTIONS */}
          {/* ============================================================== */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden">
            <h3 className="font-display font-bold text-lg text-white mb-6 flex items-center gap-2">
              <Folder className="h-5 w-5 text-pink-500" />
              Creator Portfolio Registry
            </h3>

            {portfolios.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No portfolios created yet. Click "Build New Portfolio" to start.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {portfolios.map((item) => (
                  <div key={item._id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1 truncate max-w-md">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm hover:text-pink-400 transition-colors cursor-pointer truncate">
                          {item.title}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[9px] font-mono text-slate-400 uppercase">
                          {item.template}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{item.description || 'No description added.'}</p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      <a
                        href={`/p/${item.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-3 rounded-lg bg-slate-900 border border-white/5 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Live
                      </a>
                      <Link
                        to={`/editor/${item._id}`}
                        className="py-1.5 px-3 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/20 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="py-1.5 px-3 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
        )}
        </div>
      </div>
      <Toaster toastOptions={{ duration: 4000 }} />
    </div>
  );
};

export default Dashboard;
