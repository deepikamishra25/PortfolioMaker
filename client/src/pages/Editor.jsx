import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Save, ArrowLeft, Plus, Trash2, Eye, Layout, Palette, User, Briefcase, Award, ArrowUpRight, GraduationCap } from 'lucide-react';

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('settings'); // settings, about, skills, projects, experience

  // Default placeholder data for a new portfolio so they don't start blank
  const initialNewPortfolio = {
    title: 'My Developer Portfolio',
    description: 'Personal portfolio highlighting my skills and experience.',
    slug: '',
    template: 'modern',
    theme: {
      primaryColor: '#6366f1',
      secondaryColor: '#10b981',
      backgroundColor: '#0f172a',
      textColor: '#f8fafc',
    },
    about: {
      name: 'Jane Doe',
      role: 'Full Stack Engineer',
      bio: 'Passionate software developer building responsive and user-centered web applications.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      socials: {
        github: 'https://github.com/janedoe',
        linkedin: 'https://linkedin.com/in/janedoe',
        twitter: '',
        email: 'jane@example.com',
      },
    },
    skills: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'JavaScript'],
    projects: [
      {
        title: 'Task Manager App',
        description: 'A beautiful collaborative task management tool built with MERN stack.',
        techStack: ['React', 'Node.js', 'MongoDB'],
        link: 'https://taskmanager.example.com',
        github: 'https://github.com/janedoe/taskmanager',
      },
    ],
    experience: [
      {
        company: 'Tech Solutions Inc.',
        role: 'Junior Web Developer',
        startDate: 'Jan 2024',
        endDate: 'Present',
        current: true,
        description: 'Collaborating in a team of 5 developers to ship high-performing client landing pages.',
      },
    ],
    education: [
      {
        institution: 'State University',
        degree: 'B.S. in Computer Science',
        startDate: 'Sep 2020',
        endDate: 'Jun 2024',
        description: 'Graduated with Honors. Specialization in Software Engineering.',
      },
    ],
  };

  // Form State
  const [formData, setFormData] = useState(() => {
    if (isEditMode) {
      return {
        title: '',
        description: '',
        slug: '',
        template: 'modern',
        theme: {
          primaryColor: '#6366f1',
          secondaryColor: '#10b981',
          backgroundColor: '#0f172a',
          textColor: '#f8fafc',
        },
        about: {
          name: '',
          role: '',
          bio: '',
          avatar: '',
          socials: {
            github: '',
            linkedin: '',
            twitter: '',
            email: '',
          },
        },
        skills: [],
        projects: [],
        experience: [],
        education: [],
      };
    } else {
      return initialNewPortfolio;
    }
  });

  // Skills input helper
  const [skillsText, setSkillsText] = useState(() => {
    return isEditMode ? '' : 'React, Node.js, Express, MongoDB, Tailwind CSS, JavaScript';
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchPortfolio = async () => {
        try {
          const res = await api.get(`/portfolios/${id}`);
          setFormData(res.data);
          setSkillsText(res.data.skills?.join(', ') || '');
        } catch (err) {
          console.error(err);
          alert('Failed to load portfolio.');
          navigate('/dashboard');
        } finally {
          setLoading(false);
        }
      };
      fetchPortfolio();
    }
  }, [id, isEditMode, navigate]);

  // Handle nested changes
  const handleThemeChange = (colorField, value) => {
    setFormData({
      ...formData,
      theme: {
        ...formData.theme,
        [colorField]: value,
      },
    });
  };

  const handleAboutChange = (field, value) => {
    setFormData({
      ...formData,
      about: {
        ...formData.about,
        [field]: value,
      },
    });
  };

  const handleSocialChange = (field, value) => {
    setFormData({
      ...formData,
      about: {
        ...formData.about,
        socials: {
          ...formData.about.socials,
          [field]: value,
        },
      },
    });
  };

  const handleSkillsChange = (e) => {
    setSkillsText(e.target.value);
    const skillsArray = e.target.value
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    setFormData({
      ...formData,
      skills: skillsArray,
    });
  };

  // Projects Add/Delete/Edit
  const addProject = () => {
    setFormData({
      ...formData,
      projects: [
        ...formData.projects,
        { title: 'New Project', description: 'Brief description.', techStack: [], link: '', github: '' },
      ],
    });
  };

  const deleteProject = (index) => {
    const updated = [...formData.projects];
    updated.splice(index, 1);
    setFormData({ ...formData, projects: updated });
  };

  const handleProjectChange = (index, field, value) => {
    const updated = [...formData.projects];
    if (field === 'techStack') {
      updated[index][field] = value.split(',').map((s) => s.trim());
    } else {
      updated[index][field] = value;
    }
    setFormData({ ...formData, projects: updated });
  };

  // Experience Add/Delete/Edit
  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [
        ...formData.experience,
        { company: 'New Company', role: 'Developer', startDate: 'Jan 2025', endDate: '', current: false, description: '' },
      ],
    });
  };

  const deleteExperience = (index) => {
    const updated = [...formData.experience];
    updated.splice(index, 1);
    setFormData({ ...formData, experience: updated });
  };

  const handleExperienceChange = (index, field, value) => {
    const updated = [...formData.experience];
    updated[index][field] = value;
    setFormData({ ...formData, experience: updated });
  };

  // Education Add/Delete/Edit
  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        { institution: 'New Institution', degree: 'Degree/Diploma', startDate: 'Jan 2021', endDate: '', description: '' },
      ],
    });
  };

  const deleteEducation = (index) => {
    const updated = [...formData.education];
    updated.splice(index, 1);
    setFormData({ ...formData, education: updated });
  };

  const handleEducationChange = (index, field, value) => {
    const updated = [...formData.education];
    updated[index][field] = value;
    setFormData({ ...formData, education: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditMode) {
        await api.put(`/portfolios/${id}`, formData);
        alert('Portfolio updated successfully!');
      } else {
        const res = await api.post('/portfolios', formData);
        alert('Portfolio created successfully!');
        navigate(`/editor/${res.data._id}`);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save portfolio.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-indigo-500">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden text-slate-100">
      {/* Editor Header */}
      <header className="glass-panel px-6 py-3.5 flex items-center justify-between border-b border-white/5 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-display font-bold text-lg text-white">
              {isEditMode ? `Editing: ${formData.title}` : 'Build New Portfolio'}
            </h1>
            <p className="text-xs text-slate-500">Dynamic styling, themes and responsive layout editor.</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/25 transition-all glow-btn"
        >
          {saving ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save Portfolio
            </>
          )}
        </button>
      </header>

      {/* Workspace Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Forms Panels */}
        <div className="w-full lg:w-1/2 flex flex-col border-r border-white/5 bg-slate-950 overflow-hidden">
          {/* Tab Selection */}
          <div className="flex border-b border-white/5 overflow-x-auto shrink-0 bg-slate-950/80">
            {[
              { id: 'settings', label: 'Settings', icon: Layout },
              { id: 'about', label: 'About', icon: User },
              { id: 'skills', label: 'Skills', icon: Award },
              { id: 'projects', label: 'Projects', icon: Palette },
              { id: 'experience', label: 'Experience', icon: Briefcase },
              { id: 'education', label: 'Education', icon: GraduationCap },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-400 bg-white/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Form Fields Panel (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="font-display font-bold text-lg text-white mb-4">Base Configurations</h3>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Portfolio Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. My Creative Portfolio"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Custom Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. creative-jane-doe (auto-generated if empty)"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Brief Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full h-24 bg-slate-900 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                    placeholder="Provide a short tagline summary of this portfolio showcase..."
                  />
                </div>

                <div className="border-t border-white/5 pt-6">
                  <h4 className="font-display font-semibold text-sm text-slate-300 mb-4">Layout Template</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'modern', name: 'Modern Dark', desc: 'Glassmorphic card components' },
                      { id: 'minimal', name: 'Minimalist Light', desc: 'Clean, spacing-first and elegant' },
                      { id: 'creative', name: 'Cyberpunk', desc: 'Bold gradients and floating elements' },
                      { id: 'developer', name: 'Console/Terminal', desc: 'Monospaced console view' },
                    ].map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, template: tpl.id })}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          formData.template === tpl.id
                            ? 'bg-indigo-600/10 border-indigo-500 text-white'
                            : 'bg-slate-900/60 border-white/5 text-slate-400 hover:bg-slate-900'
                        }`}
                      >
                        <span className="block font-bold text-sm text-slate-200">{tpl.name}</span>
                        <span className="block text-xs text-slate-500 mt-1">{tpl.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/5 pt-6">
                  <h4 className="font-display font-semibold text-sm text-slate-300 mb-4 font-sans">Accent Themes</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-xs font-semibold mb-2">PRIMARY ACCENT</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={formData.theme.primaryColor}
                          onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                          className="w-10 h-10 border-0 rounded cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={formData.theme.primaryColor}
                          onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                          className="bg-slate-900 border border-white/10 rounded-lg py-1.5 px-3 text-xs w-24 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 text-xs font-semibold mb-2">SECONDARY ACCENT</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={formData.theme.secondaryColor}
                          onChange={(e) => handleThemeChange('secondaryColor', e.target.value)}
                          className="w-10 h-10 border-0 rounded cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={formData.theme.secondaryColor}
                          onChange={(e) => handleThemeChange('secondaryColor', e.target.value)}
                          className="bg-slate-900 border border-white/10 rounded-lg py-1.5 px-3 text-xs w-24 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-6">
                <h3 className="font-display font-bold text-lg text-white mb-4">About Me Section</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.about.name}
                      onChange={(e) => handleAboutChange('name', e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-indigo-500"
                      placeholder="Jane Doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Professional Role</label>
                    <input
                      type="text"
                      value={formData.about.role}
                      onChange={(e) => handleAboutChange('role', e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-indigo-500"
                      placeholder="Full Stack Engineer"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Avatar / Photo URL</label>
                  <input
                    type="url"
                    value={formData.about.avatar}
                    onChange={(e) => handleAboutChange('avatar', e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Short Biography</label>
                  <textarea
                    value={formData.about.bio}
                    onChange={(e) => handleAboutChange('bio', e.target.value)}
                    className="w-full h-32 bg-slate-900 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                    placeholder="Describe your passion, professional philosophy, or coding experience..."
                  />
                </div>

                <div className="border-t border-white/5 pt-6 space-y-4">
                  <h4 className="font-display font-semibold text-sm text-slate-300">Social Connections</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-xs font-semibold mb-2">GITHUB URL</label>
                      <input
                        type="url"
                        value={formData.about.socials.github}
                        onChange={(e) => handleSocialChange('github', e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-xs text-white"
                        placeholder="https://github.com/..."
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-xs font-semibold mb-2">LINKEDIN URL</label>
                      <input
                        type="url"
                        value={formData.about.socials.linkedin}
                        onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-xs text-white"
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-xs font-semibold mb-2">TWITTER URL</label>
                      <input
                        type="url"
                        value={formData.about.socials.twitter}
                        onChange={(e) => handleSocialChange('twitter', e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-xs text-white"
                        placeholder="https://twitter.com/..."
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-xs font-semibold mb-2">PUBLIC EMAIL</label>
                      <input
                        type="email"
                        value={formData.about.socials.email}
                        onChange={(e) => handleSocialChange('email', e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-xs text-white"
                        placeholder="jane@example.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-6">
                <h3 className="font-display font-bold text-lg text-white mb-4">Core Skills</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Enter your coding languages, environments, libraries or tools separated by a comma (e.g. React, Node, Webpack). We'll automatically parse them into beautiful visual tags.
                </p>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Skills (Comma-separated)</label>
                  <textarea
                    value={skillsText}
                    onChange={handleSkillsChange}
                    className="w-full h-36 bg-slate-900 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-indigo-500 resize-none font-mono text-sm leading-relaxed"
                    placeholder="e.g. React, Node.js, Express, MongoDB, Tailwind CSS, AWS, TypeScript"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display font-bold text-lg text-white">Projects Highlight</h3>
                  <button
                    type="button"
                    onClick={addProject}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    Add Project
                  </button>
                </div>

                {formData.projects.length === 0 ? (
                  <div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-slate-500 text-sm">
                    No projects added. Click "Add Project" to showcase your work.
                  </div>
                ) : (
                  formData.projects.map((project, index) => (
                    <div key={index} className="p-5 bg-slate-900/60 border border-white/5 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-200 text-sm">Project #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => deleteProject(index)}
                          className="p-1.5 rounded bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-400 text-xs font-semibold mb-2.5">PROJECT TITLE</label>
                          <input
                            type="text"
                            value={project.title}
                            onChange={(e) => handleProjectChange(index, 'title', e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg py-2 px-3 text-xs text-white"
                            placeholder="e.g. Chat App"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 text-xs font-semibold mb-2.5">TECH STACK (comma-sep)</label>
                          <input
                            type="text"
                            value={project.techStack?.join(', ') || ''}
                            onChange={(e) => handleProjectChange(index, 'techStack', e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg py-2 px-3 text-xs text-white"
                            placeholder="e.g. React, Socket.io"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 text-xs font-semibold mb-2.5">DESCRIPTION</label>
                        <textarea
                          value={project.description}
                          onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                          className="w-full h-20 bg-slate-950 border border-white/10 rounded-lg py-2 px-3 text-xs text-white resize-none"
                          placeholder="What did you build? What problems did it solve?"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-400 text-xs font-semibold mb-2.5">LIVE URL</label>
                          <input
                            type="url"
                            value={project.link || ''}
                            onChange={(e) => handleProjectChange(index, 'link', e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg py-2 px-3 text-xs text-white"
                            placeholder="https://..."
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 text-xs font-semibold mb-2.5">GITHUB URL</label>
                          <input
                            type="url"
                            value={project.github || ''}
                            onChange={(e) => handleProjectChange(index, 'github', e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg py-2 px-3 text-xs text-white"
                            placeholder="https://github.com/..."
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'experience' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display font-bold text-lg text-white">Work Experience</h3>
                  <button
                    type="button"
                    onClick={addExperience}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    Add Work
                  </button>
                </div>

                {formData.experience.length === 0 ? (
                  <div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-slate-500 text-sm">
                    No work history added. Click "Add Work" to add credentials.
                  </div>
                ) : (
                  formData.experience.map((exp, index) => (
                    <div key={index} className="p-5 bg-slate-900/60 border border-white/5 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-200 text-sm">Experience #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => deleteExperience(index)}
                          className="p-1.5 rounded bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-400 text-xs font-semibold mb-2.5">COMPANY NAME</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg py-2 px-3 text-xs text-white"
                            placeholder="e.g. Google"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 text-xs font-semibold mb-2.5">ROLE / DESIGNATION</label>
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => handleExperienceChange(index, 'role', e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg py-2 px-3 text-xs text-white"
                            placeholder="e.g. Senior Frontend Dev"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-slate-400 text-xs font-semibold mb-2.5">START DATE</label>
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg py-2 px-3 text-xs text-white"
                            placeholder="e.g. Jan 2023"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 text-xs font-semibold mb-2.5">END DATE</label>
                          <input
                            type="text"
                            value={exp.endDate || ''}
                            onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                            disabled={exp.current}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg py-2 px-3 text-xs text-white disabled:opacity-50"
                            placeholder="e.g. Dec 2024"
                          />
                        </div>

                        <div className="flex flex-col justify-center items-center pt-5">
                          <label className="flex items-center gap-2 cursor-pointer text-slate-400 text-xs font-semibold">
                            <input
                              type="checkbox"
                              checked={exp.current}
                              onChange={(e) => {
                                handleExperienceChange(index, 'current', e.target.checked);
                                if (e.target.checked) {
                                  handleExperienceChange(index, 'endDate', 'Present');
                                }
                              }}
                              className="rounded border-white/10 bg-slate-950 text-indigo-500 focus:ring-0 focus:ring-offset-0"
                            />
                            Is Current
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 text-xs font-semibold mb-2.5">RESPONSIBILITIES</label>
                        <textarea
                          value={exp.description || ''}
                          onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                          className="w-full h-20 bg-slate-950 border border-white/10 rounded-lg py-2 px-3 text-xs text-white resize-none"
                          placeholder="Summarize key tasks, impacts, or tech stacks used..."
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Live Premium Interactive Preview */}
        <div className="hidden lg:flex w-1/2 flex-col bg-slate-900 border-l border-white/5 overflow-hidden">
          {/* Preview Toolbar */}
          <div className="px-6 py-3 bg-slate-950 border-b border-white/5 flex items-center justify-between shrink-0">
            <span className="text-slate-400 font-semibold text-xs tracking-wider flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-indigo-400" />
              LIVE BUILD PREVIEW (DESKTOP MODE)
            </span>
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            </div>
          </div>

          {/* Preview Render Framework */}
          <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-slate-950/40">
            {/* The mock browser window inside the app */}
            <div
              className="w-full rounded-2xl shadow-2xl border border-white/10 flex flex-col transition-all overflow-hidden"
              style={{
                backgroundColor: formData.template === 'minimal' ? '#ffffff' : formData.theme.backgroundColor,
                color: formData.template === 'minimal' ? '#0f172a' : formData.theme.textColor,
                fontFamily: formData.template === 'developer' ? 'monospace' : 'sans-serif',
              }}
            >
              {/* Template header */}
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <span className="font-bold text-sm tracking-wider uppercase" style={{ color: formData.theme.primaryColor }}>
                  {formData.about.name ? formData.about.name.split(' ')[0] : 'PORTFOLIO'}.
                </span>
                <div className="flex gap-4 text-xs font-semibold opacity-75">
                  <span>About</span>
                  <span>Skills</span>
                  <span>Projects</span>
                  <span>Experience</span>
                </div>
              </div>

              {/* Template Body */}
              <div className="p-8 space-y-12">
                {/* Hero / About Card */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    {formData.about.avatar && (
                      <img
                        src={formData.about.avatar}
                        alt="Avatar"
                        className="w-16 h-16 rounded-full object-cover border"
                        style={{ borderColor: formData.theme.primaryColor }}
                      />
                    )}
                    <div>
                      <h2 className="text-2xl font-extrabold tracking-tight">
                        {formData.about.name || 'Your Name'}
                      </h2>
                      <p className="text-sm font-semibold opacity-80" style={{ color: formData.theme.primaryColor }}>
                        {formData.about.role || 'Your Role'}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed opacity-70">
                    {formData.about.bio || 'Your biography will appear here as you edit the fields...'}
                  </p>
                </div>

                {/* Skills render */}
                <div className="space-y-3">
                  <h3 className="font-bold text-sm tracking-widest uppercase opacity-75">Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.skills.length === 0 ? (
                      <span className="text-xs opacity-50">List of skill tags...</span>
                    ) : (
                      formData.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-xs font-semibold border"
                          style={{
                            backgroundColor: `${formData.theme.primaryColor}15`,
                            borderColor: `${formData.theme.primaryColor}30`,
                            color: formData.theme.primaryColor,
                          }}
                        >
                          {skill}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Projects render */}
                <div className="space-y-4">
                  <h3 className="font-bold text-sm tracking-widest uppercase opacity-75">Featured Projects</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {formData.projects.length === 0 ? (
                      <div className="p-4 rounded border border-white/5 text-center text-xs opacity-50">
                        Add projects on the builder to render cards.
                      </div>
                    ) : (
                      formData.projects.map((proj, i) => (
                        <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/5 space-y-2">
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-sm">{proj.title}</h4>
                            <div className="flex gap-2">
                              {proj.link && <ArrowUpRight className="h-4 w-4 opacity-50 hover:opacity-100" />}
                            </div>
                          </div>
                          <p className="text-xs opacity-75 leading-relaxed">{proj.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {proj.techStack?.map((t, j) => (
                              <span
                                key={j}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 border border-white/5 text-slate-400"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Experience render */}
                <div className="space-y-4">
                  <h3 className="font-bold text-sm tracking-widest uppercase opacity-75">Work Experience</h3>
                  <div className="space-y-4">
                    {formData.experience.length === 0 ? (
                      <div className="text-xs opacity-50">Add experience credentials.</div>
                    ) : (
                      formData.experience.map((exp, i) => (
                        <div key={i} className="flex gap-4 border-l pl-4 relative" style={{ borderColor: `${formData.theme.primaryColor}40` }}>
                          <div
                            className="w-2 h-2 rounded-full absolute left-[-4.5px] top-1.5"
                            style={{ backgroundColor: formData.theme.primaryColor }}
                          ></div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-xs">{exp.role}</h4>
                            <div className="flex gap-2 text-[10px] opacity-70">
                              <span className="font-semibold text-slate-300">{exp.company}</span>
                              <span>&bull;</span>
                              <span>
                                {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                              </span>
                            </div>
                            <p className="text-xs opacity-75 font-sans leading-relaxed">{exp.description}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Education render */}
                <div className="space-y-4">
                  <h3 className="font-bold text-sm tracking-widest uppercase opacity-75">Education</h3>
                  <div className="space-y-4">
                    {formData.education?.length === 0 ? (
                      <div className="text-xs opacity-50">Add education credentials.</div>
                    ) : (
                      formData.education?.map((edu, i) => (
                        <div key={i} className="flex gap-4 border-l pl-4 relative" style={{ borderColor: `${formData.theme.primaryColor}40` }}>
                          <div
                            className="w-2 h-2 rounded-full absolute left-[-4.5px] top-1.5"
                            style={{ backgroundColor: formData.theme.primaryColor }}
                          ></div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-xs">{edu.degree}</h4>
                            <div className="flex gap-2 text-[10px] opacity-70">
                              <span className="font-semibold text-slate-300">{edu.institution}</span>
                              <span>&bull;</span>
                              <span>
                                {edu.startDate} - {edu.endDate || 'Present'}
                              </span>
                            </div>
                            <p className="text-xs opacity-75 font-sans leading-relaxed">{edu.description}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
