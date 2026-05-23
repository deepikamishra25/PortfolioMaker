import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Sparkles, User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  // React Hook Form
  const {
    register: formRegister,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const watchPassword = watch('password');

  const onSubmit = async (data) => {
    setApiError('');
    setLoading(true);

    const res = await register(data.username, data.email, data.password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setApiError(res.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-grid-pattern flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-[20%] left-[20%] w-[350px] h-[350px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[20%] w-[350px] h-[350px] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-white/5 relative z-10">
        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-tr from-violet-600 to-indigo-500 p-2 rounded-xl text-white">
              <Sparkles className="h-5 w-5 animate-pulse-slow" />
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight text-white">
              Portfolio<span className="text-indigo-400 font-semibold text-lg">Maker</span>
            </span>
          </Link>
          <h2 className="font-display text-2xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-slate-400 text-sm text-center">
            Sign up for free and build beautiful online portfolios today.
          </p>
        </div>

        {apiError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-400 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="username">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <User className="h-5 w-5" />
              </span>
              <input
                id="username"
                type="text"
                {...formRegister('username', {
                  required: 'Username is required',
                  minLength: { value: 3, message: 'Must be at least 3 characters' },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: 'Only alphanumeric characters and underscores allowed',
                  },
                })}
                className={`w-full bg-slate-900/60 border ${
                  errors.username ? 'border-rose-500 focus:border-rose-500' : 'border-white/10 focus:border-indigo-500'
                } rounded-xl py-2.5 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none transition-colors`}
                placeholder="yourusername"
              />
            </div>
            {errors.username && (
              <span className="text-rose-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.username.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Mail className="h-5 w-5" />
              </span>
              <input
                id="email"
                type="email"
                {...formRegister('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                    message: 'Please enter a valid email address',
                  },
                })}
                className={`w-full bg-slate-900/60 border ${
                  errors.email ? 'border-rose-500 focus:border-rose-500' : 'border-white/10 focus:border-indigo-500'
                } rounded-xl py-2.5 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none transition-colors`}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && (
              <span className="text-rose-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.email.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Lock className="h-5 w-5" />
              </span>
              <input
                id="password"
                type="password"
                {...formRegister('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
                className={`w-full bg-slate-900/60 border ${
                  errors.password ? 'border-rose-500 focus:border-rose-500' : 'border-white/10 focus:border-indigo-500'
                } rounded-xl py-2.5 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none transition-colors`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <span className="text-rose-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.password.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Lock className="h-5 w-5" />
              </span>
              <input
                id="confirmPassword"
                type="password"
                {...formRegister('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === watchPassword || 'Passwords do not match',
                })}
                className={`w-full bg-slate-900/60 border ${
                  errors.confirmPassword ? 'border-rose-500 focus:border-rose-500' : 'border-white/10 focus:border-indigo-500'
                } rounded-xl py-2.5 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none transition-colors`}
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && (
              <span className="text-rose-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 disabled:cursor-not-allowed text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all glow-btn"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                Create Account
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-slate-400 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
