import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, uploadAvatar } from '../services/profileService';

// ── Pure helpers (also tested in profileHelpers.test.js) ─────────────────────

/**
 * Prepends the server base URL to a relative profileImage path.
 * @param {string} relativePath - e.g. '/uploads/avatars/file.jpg'
 * @param {string} apiUrl - e.g. 'http://localhost:5000/api'
 * @returns {string} full URL
 */
export function buildImageUrl(relativePath, apiUrl) {
  if (!relativePath) return '';
  const base = (apiUrl || '').replace(/\/api\/?$/, '');
  return `${base}${relativePath}`;
}

/**
 * Resolves the error message from a failed API call.
 * @param {unknown} err - Axios error or any thrown value
 * @returns {string}
 */
export function resolveErrorMessage(err) {
  return err?.response?.data?.message || 'Failed to update profile';
}

// ── ProfileForm component ─────────────────────────────────────────────────────

const ProfileForm = () => {
  const { user, setUser } = useAuth();
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      displayName: '',
      username: '',
      email: '',
      bio: '',
      socialLinks: {
        github: '',
        linkedin: '',
        twitter: '',
        website: '',
      },
    },
  });

  // Load profile on mount
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProfile();
        const data = res.data;
        reset({
          displayName: data.displayName || '',
          username: data.username || '',
          email: data.email || '',
          bio: data.bio || '',
          socialLinks: {
            github: data.socialLinks?.github || '',
            linkedin: data.socialLinks?.linkedin || '',
            twitter: data.socialLinks?.twitter || '',
            website: data.socialLinks?.website || '',
          },
        });
        if (data.profileImage) {
          setAvatarPreview(
            buildImageUrl(data.profileImage, import.meta.env.VITE_API_URL)
          );
        }
      } catch (err) {
        toast.error(resolveErrorMessage(err));
      } finally {
        setPageLoading(false);
      }
    };
    load();
  }, [reset]);

  // Handle file selection — show local preview immediately
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  // Upload avatar to server
  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setUploading(true);
    try {
      const res = await uploadAvatar(avatarFile);
      const newPath = res.data.profileImage;
      const newUrl = buildImageUrl(newPath, import.meta.env.VITE_API_URL);
      setAvatarPreview(newUrl);
      setAvatarFile(null);
      setUser({ ...user, profileImage: newPath });
      toast.success('Profile image updated');
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  // Submit profile update
  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await updateProfile(data);
      const updatedUser = res.data;
      setUser(updatedUser);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading spinner ──────────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5">
        <h2 className="font-display text-2xl font-extrabold text-white">
          Edit Profile
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Update your personal details, bio, and social links.
        </p>
      </div>

      {/* Avatar section */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col sm:flex-row items-center gap-6">
        {/* Avatar preview */}
        <div className="relative shrink-0">
          <div className="h-24 w-24 rounded-full border-2 border-pink-500/40 bg-slate-800 flex items-center justify-center overflow-hidden shadow-lg shadow-pink-500/10">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-slate-500" />
            )}
          </div>
        </div>

        {/* Upload controls */}
        <div className="flex flex-col gap-3 items-center sm:items-start">
          <p className="text-sm text-slate-400">
            JPEG, PNG, or WebP · max 5 MB
          </p>
          <div className="flex gap-3 flex-wrap justify-center sm:justify-start">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-slate-800 border border-white/10 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
            >
              Choose File
            </button>
            {avatarFile && (
              <button
                type="button"
                onClick={handleAvatarUpload}
                disabled={uploading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-pink-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6">
          {/* Two-column grid on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Display Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Display Name
              </label>
              <input
                type="text"
                {...register('displayName')}
                placeholder="Jane Doe"
                className="bg-slate-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>

            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Username <span className="text-pink-500">*</span>
              </label>
              <input
                type="text"
                {...register('username', { required: 'Username is required' })}
                placeholder="janedoe"
                className={`bg-slate-900/60 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors ${
                  errors.username
                    ? 'border-rose-500 focus:border-rose-500'
                    : 'border-white/10 focus:border-pink-500'
                }`}
              />
              {errors.username && (
                <p className="text-xs text-rose-400">{errors.username.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Email <span className="text-pink-500">*</span>
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                    message: 'Please provide a valid email address',
                  },
                })}
                placeholder="jane@example.com"
                className={`bg-slate-900/60 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors ${
                  errors.email
                    ? 'border-rose-500 focus:border-rose-500'
                    : 'border-white/10 focus:border-pink-500'
                }`}
              />
              {errors.email && (
                <p className="text-xs text-rose-400">{errors.email.message}</p>
              )}
            </div>

            {/* Bio — spans full width on md+ */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Bio
              </label>
              <textarea
                rows={4}
                {...register('bio', {
                  maxLength: {
                    value: 500,
                    message: 'Bio cannot exceed 500 characters',
                  },
                })}
                placeholder="Tell the world about yourself…"
                className={`bg-slate-900/60 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors resize-none ${
                  errors.bio
                    ? 'border-rose-500 focus:border-rose-500'
                    : 'border-white/10 focus:border-pink-500'
                }`}
              />
              {errors.bio && (
                <p className="text-xs text-rose-400">{errors.bio.message}</p>
              )}
            </div>
          </div>

          {/* Social Links section */}
          <div>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 inline-block"></span>
              Social Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'socialLinks.github', label: 'GitHub', placeholder: 'https://github.com/username' },
                { name: 'socialLinks.linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
                { name: 'socialLinks.twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/username' },
                { name: 'socialLinks.website', label: 'Website', placeholder: 'https://yoursite.com' },
              ].map(({ name, label, placeholder }) => (
                <div key={name} className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {label}
                  </label>
                  <input
                    type="url"
                    {...register(name, {
                      validate: (v) =>
                        !v || v === '' || v.startsWith('https://')
                          ? true
                          : 'Social links must start with https:// or be empty',
                    })}
                    placeholder={placeholder}
                    className={`bg-slate-900/60 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors ${
                      errors.socialLinks?.[name.split('.')[1]]
                        ? 'border-rose-500 focus:border-rose-500'
                        : 'border-white/10 focus:border-pink-500'
                    }`}
                  />
                  {errors.socialLinks?.[name.split('.')[1]] && (
                    <p className="text-xs text-rose-400">
                      {errors.socialLinks[name.split('.')[1]].message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-pink-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent inline-block"></span>
              )}
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
