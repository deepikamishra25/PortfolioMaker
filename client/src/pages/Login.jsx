import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const isExpired = searchParams.get('expired') === 'true';

  // React Hook Form
  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      emailOrUsername: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setApiError('');
    setLoading(true);

    const res = await login(data.emailOrUsername, data.password);
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
          <h2 className="font-display text-2xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-slate-400 text-sm text-center">
            Sign in to manage, edit and build your premium portfolios.
          </p>
        </div>

        {/* Notices */}
        {isExpired && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-amber-400 text-sm animate-float">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>Your session has expired. Please sign in again.</span>
          </div>
        )}

        {apiError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-400 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="emailOrUsername">
              Username or Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Mail className="h-5 w-5" />
              </span>
              <input
                id="emailOrUsername"
                type="text"
                {...formRegister('emailOrUsername', {
                  required: 'Username or Email is required',
                  minLength: { value: 3, message: 'Must be at least 3 characters' },
                })}
                className={`w-full bg-slate-900/60 border ${
                  errors.emailOrUsername ? 'border-rose-500 focus:border-rose-500' : 'border-white/10 focus:border-indigo-500'
                } rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none transition-colors`}
                placeholder="you@example.com or username"
              />
            </div>
            {errors.emailOrUsername && (
              <span className="text-rose-400 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.emailOrUsername.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="password">
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
                } rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none transition-colors`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <span className="text-rose-400 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.password.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 disabled:cursor-not-allowed text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all glow-btn"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                Sign In
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-slate-400 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:underline font-medium">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
