import React, { useState, useEffect } from 'react';
import {
  Cpu,
  ArrowLeft,
  Mail,
  Lock,
  User as UserIcon,
  Github,
  Building2,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  Check,
} from 'lucide-react';
import { apiClient } from '../../shared/api/apiClient';

export const AuthPage = ({ initialMode = 'login', onBackToLanding, onAuthSuccess }) => {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'developer',
    githubUsername: '',
    organization: '',
  });

  useEffect(() => {
    setMode(initialMode);
    setErrorMsg('');
    setShowPassword(false);
  }, [initialMode]);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setErrorMsg('');
    setShowPassword(false);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const res = await apiClient.login({
        email: loginForm.email.trim(),
        password: loginForm.password,
      });
      onAuthSuccess(res);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to sign in. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (registerForm.password.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiClient.register({
        name: registerForm.name.trim(),
        email: registerForm.email.trim(),
        password: registerForm.password,
        role: registerForm.role,
        githubUsername: registerForm.githubUsername.trim(),
        organization: registerForm.organization.trim(),
      });
      onAuthSuccess(res);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to create account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col lg:flex-row">
      {/* Left Column: Clean Brand Context */}
      <aside className="lg:w-[44%] border-b lg:border-b-0 lg:border-r border-zinc-900 bg-zinc-950 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBackToLanding}
              className="flex items-center space-x-2.5 text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-950 flex items-center justify-center">
                <Cpu size={17} />
              </div>
              <span className="font-semibold tracking-tight text-zinc-100 text-base">
                Test360 AI
              </span>
            </button>

            <button
              type="button"
              onClick={onBackToLanding}
              className="inline-flex items-center space-x-1.5 text-xs text-zinc-400 hover:text-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Back</span>
            </button>
          </div>

          <div className="mt-10 lg:mt-16 space-y-3 max-w-md">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50 leading-snug">
              {mode === 'login'
                ? 'Welcome back to your workspace.'
                : 'Create your Test360 AI account.'}
            </h1>

            <p className="text-sm text-zinc-400 leading-relaxed">
              {mode === 'login'
                ? 'Sign in to check pull request results, view affected files, and manage repositories.'
                : 'Set up your account to connect repositories and run automatic pull request checks.'}
            </p>
          </div>

          <ul className="hidden lg:block mt-10 space-y-3.5 max-w-md text-sm text-zinc-300">
            <li className="flex items-start space-x-2.5">
              <Check size={16} className="text-zinc-400 mt-0.5 shrink-0" />
              <span>Automatic tests whenever a pull request is opened</span>
            </li>
            <li className="flex items-start space-x-2.5">
              <Check size={16} className="text-zinc-400 mt-0.5 shrink-0" />
              <span>Clear breakdown of unit, API, UI, and load test results</span>
            </li>
            <li className="flex items-start space-x-2.5">
              <Check size={16} className="text-zinc-400 mt-0.5 shrink-0" />
              <span>Safe isolated container runs for every check</span>
            </li>
          </ul>
        </div>

        <div className="hidden lg:block text-xs text-zinc-600 pt-8 border-t border-zinc-900">
          Test360 AI · Automated PR Testing Platform
        </div>
      </aside>

      {/* Right Column: Auth Card */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-zinc-950">
        <div className="w-full max-w-md space-y-5">
          {/* Segmented Mode Toggle */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`py-2 text-xs font-medium rounded-lg transition-colors ${
                mode === 'login'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`py-2 text-xs font-medium rounded-lg transition-colors ${
                mode === 'register'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Auth Form Container */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-50">
                {mode === 'login' ? 'Sign in' : 'Create account'}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                {mode === 'login'
                  ? 'Enter your email and password to continue.'
                  : 'Enter your details below to register.'}
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/60 text-xs text-rose-200 flex items-start space-x-2">
                <AlertCircle size={15} className="text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="w-full pl-10 pr-10 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 disabled:bg-zinc-300 disabled:cursor-not-allowed text-zinc-950 font-semibold rounded-lg text-sm transition-colors flex items-center justify-center space-x-2 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign in</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label htmlFor="reg-name" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      id="reg-name"
                      type="text"
                      autoComplete="name"
                      placeholder="Alex Rivera"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-email" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Email <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      id="reg-email"
                      type="email"
                      autoComplete="email"
                      placeholder="alex@company.com"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="reg-password" className="block text-xs font-medium text-zinc-300">
                      Password <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[11px] text-zinc-500">Min. 4 characters</span>
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Create a password"
                      minLength={4}
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      className="w-full pl-10 pr-10 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-role" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Role
                  </label>
                  <select
                    id="reg-role"
                    value={registerForm.role}
                    onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors"
                  >
                    <option value="developer">Developer</option>
                    <option value="reviewer">Reviewer / QA</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="reg-github" className="block text-xs font-medium text-zinc-300 mb-1.5">
                      GitHub Username
                    </label>
                    <div className="relative">
                      <Github size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        id="reg-github"
                        type="text"
                        placeholder="username"
                        value={registerForm.githubUsername}
                        onChange={(e) => setRegisterForm({ ...registerForm, githubUsername: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="reg-org" className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Organization
                    </label>
                    <div className="relative">
                      <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        id="reg-org"
                        type="text"
                        placeholder="Team / Org"
                        value={registerForm.organization}
                        onChange={(e) => setRegisterForm({ ...registerForm, organization: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 disabled:bg-zinc-300 disabled:cursor-not-allowed text-zinc-950 font-semibold rounded-lg text-sm transition-colors flex items-center justify-center space-x-2 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create account</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="pt-4 border-t border-zinc-800 text-center text-xs text-zinc-400">
              {mode === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="text-zinc-100 hover:underline font-medium"
                  >
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-zinc-100 hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
