import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Shield, 
  Github, 
  Mail, 
  Building2, 
  Check, 
  AlertCircle, 
  Users, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Edit3 
} from 'lucide-react';
import { apiClient } from '../../shared/api/apiClient';

export const ProfileAuthView = ({
  currentUser,
  onUserChange,
}) => {
  const [mode, setMode] = useState('profile'); // 'profile' | 'login' | 'register'
  const [usersList, setUsersList] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Form state for login
  const [loginForm, setLoginForm] = useState({
    email: '',
    githubUsername: '',
    password: '',
  });

  // Form state for register
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    githubUsername: '',
    role: 'developer',
    organization: '',
    bio: '',
  });

  // Form state for editing profile
  const [editForm, setEditForm] = useState({
    name: '',
    githubUsername: '',
    role: 'developer',
    organization: '',
    bio: '',
  });

  // Load team users from MongoDB
  const loadUsers = async () => {
    try {
      const res = await apiClient.listUsers();
      if (res?.users) {
        setUsersList(res.users);
      }
    } catch (err) {
      console.warn('Could not load users list:', err.message);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (currentUser) {
      setEditForm({
        name: currentUser.name || '',
        githubUsername: currentUser.githubUsername || '',
        role: currentUser.role || 'developer',
        organization: currentUser.organization || '',
        bio: currentUser.bio || '',
      });
    }
  }, [currentUser]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await apiClient.login(loginForm);
      onUserChange(res.user);
      setSuccessMsg(`Welcome back, ${res.user.name}!`);
      setMode('profile');
      loadUsers();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await apiClient.register(registerForm);
      onUserChange(res.user);
      setSuccessMsg(`Account created successfully for ${res.user.name}!`);
      setMode('profile');
      loadUsers();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    }
  };

  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await apiClient.updateProfile(currentUser._id, editForm);
      onUserChange(res.user);
      setSuccessMsg('Profile updated successfully in MongoDB!');
      setIsEditing(false);
      loadUsers();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile');
    }
  };

  const handleSwitchAccount = (u) => {
    onUserChange(u);
    setSuccessMsg(`Switched active user to ${u.name} (${u.role})`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSignOut = () => {
    onUserChange(null);
    setMode('login');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">
            <UserIcon size={14} className="text-zinc-400" />
            <span>Authentication &amp; User Profile Management</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
            User Account &amp; Access Roles
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your authenticated user identity, role permissions (Developer, Reviewer, Admin), and session credentials.
          </p>
        </div>

        {currentUser ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg transition-colors flex items-center space-x-1.5"
            >
              <Edit3 size={13} />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>
            <button
              onClick={handleSignOut}
              className="px-3.5 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 text-xs rounded-lg transition-colors flex items-center space-x-1.5"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMode('login')}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                mode === 'login' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                mode === 'register' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Register
            </button>
          </div>
        )}
      </div>

      {/* Status Banners */}
      {errorMsg && (
        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-200 flex items-center space-x-2">
          <AlertCircle size={15} className="text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-xs text-emerald-200 flex items-center space-x-2">
          <Check size={15} className="text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Content Area */}
      {currentUser && mode === 'profile' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Profile Card */}
          <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center space-x-4">
                <img
                  src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=18181b&color=fafafa`}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-full border border-zinc-700 object-cover"
                />
                <div>
                  <h2 className="text-lg font-bold text-zinc-100">{currentUser.name}</h2>
                  <div className="flex items-center space-x-2 text-xs text-zinc-400 mt-0.5">
                    <Mail size={12} className="text-zinc-500" />
                    <span>{currentUser.email}</span>
                  </div>
                  {currentUser.githubUsername && (
                    <div className="flex items-center space-x-2 text-xs text-zinc-400 mt-0.5 font-mono">
                      <Github size={12} className="text-zinc-500" />
                      <span>github.com/{currentUser.githubUsername}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                  <Shield size={12} className="mr-1.5" />
                  <span>{currentUser.role}</span>
                </span>
                <span className="block text-[10px] text-zinc-500 font-mono mt-1">
                  Active Session
                </span>
              </div>
            </div>

            {/* Profile Edit or Info Display */}
            {isEditing ? (
              <form onSubmit={handleEditProfileSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-300 mb-1 font-medium">Full Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 mb-1 font-medium">Role Permission</label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="developer">Developer (Test &amp; 1-Click Repair)</option>
                      <option value="reviewer">Reviewer / QA Lead (Scorecards &amp; Triage)</option>
                      <option value="admin">Repository Admin (App Config &amp; Credentials)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-300 mb-1 font-medium">GitHub Username</label>
                    <input
                      type="text"
                      value={editForm.githubUsername}
                      onChange={(e) => setEditForm({ ...editForm, githubUsername: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 mb-1 font-medium">Organization / University</label>
                    <input
                      type="text"
                      value={editForm.organization}
                      onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">Bio / Notes</label>
                  <textarea
                    rows={2}
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3.5 py-1.5 text-zinc-400 hover:text-zinc-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800">
                  <span className="text-[11px] text-zinc-500 block uppercase font-mono mb-1">Organization</span>
                  <span className="text-zinc-200 font-medium">{currentUser.organization || 'Independent Developer'}</span>
                </div>
                <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800">
                  <span className="text-[11px] text-zinc-500 block uppercase font-mono mb-1">System Permissions</span>
                  <span className="text-zinc-200 font-medium capitalize">{currentUser.role} Privileges Active</span>
                </div>
                {currentUser.bio && (
                  <div className="sm:col-span-2 p-3 bg-zinc-950/60 rounded-lg border border-zinc-800">
                    <span className="text-[11px] text-zinc-500 block uppercase font-mono mb-1">Bio</span>
                    <span className="text-zinc-300">{currentUser.bio}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Directory in MongoDB */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-zinc-800">
              <Users size={16} className="text-indigo-400" />
              <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
                Registered Accounts ({usersList.length})
              </h3>
            </div>
            <p className="text-[11px] text-zinc-400">
              Accounts persisted in MongoDB. Click any account to switch active user role for testing:
            </p>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {usersList.map((u) => {
                const isActive = currentUser?._id === u._id;
                return (
                  <div
                    key={u._id}
                    onClick={() => handleSwitchAccount(u)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between text-xs ${
                      isActive
                        ? 'border-indigo-500/50 bg-indigo-950/20 text-zinc-100'
                        : 'border-zinc-800/80 bg-zinc-950/40 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs uppercase text-zinc-300">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-semibold leading-tight">{u.name}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">{u.email}</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium capitalize bg-zinc-800 text-zinc-300">
                      {u.role}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Sign In or Register Form */
        <div className="max-w-md mx-auto bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center space-x-2">
              {mode === 'login' ? <LogIn size={16} className="text-indigo-400" /> : <UserPlus size={16} className="text-indigo-400" />}
              <span>{mode === 'login' ? 'Sign In with User Credentials' : 'Create New User Account'}</span>
            </h3>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Email Address or GitHub Username</label>
                <input
                  type="text"
                  placeholder="e.g. dev@domain.com or githubUser"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Password (Optional)</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-colors mt-2"
              >
                Sign In
              </button>

              <div className="text-center pt-2 border-t border-zinc-800 text-[11px] text-zinc-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-indigo-400 hover:underline font-medium"
                >
                  Register here
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Email Address *</label>
                <input
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">Role</label>
                  <select
                    value={registerForm.role}
                    onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                    className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="developer">Developer</option>
                    <option value="reviewer">Reviewer / QA</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">GitHub Handle</label>
                  <input
                    type="text"
                    placeholder="githubUsername"
                    value={registerForm.githubUsername}
                    onChange={(e) => setRegisterForm({ ...registerForm, githubUsername: e.target.value })}
                    className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Organization / University</label>
                <input
                  type="text"
                  placeholder="e.g. SZABIST University"
                  value={registerForm.organization}
                  onChange={(e) => setRegisterForm({ ...registerForm, organization: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-colors mt-2"
              >
                Register &amp; Save to Database
              </button>

              <div className="text-center pt-2 border-t border-zinc-800 text-[11px] text-zinc-400">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-indigo-400 hover:underline font-medium"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
