import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Shield,
  Github,
  Mail,
  Check,
  AlertCircle,
  LogOut,
  Edit3,
  Trash2,
  Building2,
  Calendar,
} from 'lucide-react';
import { apiClient } from '../../shared/api/apiClient';

export const ProfileAuthView = ({ currentUser, onUserChange, onSignOut }) => {
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [editForm, setEditForm] = useState({
    name: '',
    githubUsername: '',
    role: 'developer',
    organization: '',
    bio: '',
  });

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

  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await apiClient.updateProfile(currentUser._id, editForm);
      onUserChange(res.user);
      setSuccessMsg('Profile updated successfully in MongoDB.');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile');
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        'Are you sure you want to permanently delete your account? This action cannot be undone.'
      )
    ) {
      return;
    }
    setErrorMsg('');
    try {
      await apiClient.deleteAccount(currentUser._id);
      if (onSignOut) {
        onSignOut();
      } else {
        onUserChange(null);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete account');
    }
  };

  const handleSignOutClick = () => {
    if (onSignOut) {
      onSignOut();
    } else {
      onUserChange(null);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">
            <UserIcon size={14} className="text-zinc-400" />
            <span>Account &amp; Profile Settings</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
            Workspace Profile &amp; Permissions
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your authenticated identity, organization details, and workspace role.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg transition-colors flex items-center space-x-1.5"
          >
            <Edit3 size={13} />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>
          <button
            type="button"
            onClick={handleSignOutClick}
            className="px-3.5 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 text-xs rounded-lg transition-colors flex items-center space-x-1.5"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Status Banners */}
      {errorMsg && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs text-rose-200 flex items-center space-x-2">
          <AlertCircle size={15} className="text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-xs text-emerald-200 flex items-center space-x-2">
          <Check size={15} className="text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Active Profile Card */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-5 border-b border-zinc-800 gap-4">
          <div className="flex items-center space-x-4">
            <img
              src={
                currentUser.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=18181b&color=fafafa`
              }
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

          <div className="sm:text-right">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
              <Shield size={12} className="mr-1.5" />
              <span>{currentUser.role}</span>
            </span>
            <span className="block text-[10px] text-emerald-400 font-mono mt-1.5">
              ● Authenticated Session
            </span>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleEditProfileSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-300 mb-1.5 font-medium">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1.5 font-medium">Role Permission</label>
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
                <label className="block text-zinc-300 mb-1.5 font-medium">GitHub Username</label>
                <input
                  type="text"
                  value={editForm.githubUsername}
                  onChange={(e) => setEditForm({ ...editForm, githubUsername: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1.5 font-medium">Organization / Team</label>
                <input
                  type="text"
                  value={editForm.organization}
                  onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 mb-1.5 font-medium">Bio / Notes</label>
              <textarea
                rows={3}
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
            <div className="p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-800">
              <span className="text-[11px] text-zinc-500 flex items-center space-x-1.5 uppercase font-mono mb-1">
                <Building2 size={12} />
                <span>Organization</span>
              </span>
              <span className="text-zinc-200 font-medium">
                {currentUser.organization || 'Independent Developer'}
              </span>
            </div>
            <div className="p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-800">
              <span className="text-[11px] text-zinc-500 flex items-center space-x-1.5 uppercase font-mono mb-1">
                <Shield size={12} />
                <span>System Permissions</span>
              </span>
              <span className="text-zinc-200 font-medium capitalize">
                {currentUser.role} Privileges Active
              </span>
            </div>
            {currentUser.createdAt && (
              <div className="p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-800">
                <span className="text-[11px] text-zinc-500 flex items-center space-x-1.5 uppercase font-mono mb-1">
                  <Calendar size={12} />
                  <span>Member Since</span>
                </span>
                <span className="text-zinc-200 font-medium">
                  {new Date(currentUser.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
            {currentUser.bio && (
              <div className="sm:col-span-2 p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-800">
                <span className="text-[11px] text-zinc-500 block uppercase font-mono mb-1">Bio</span>
                <span className="text-zinc-300 leading-relaxed">{currentUser.bio}</span>
              </div>
            )}
          </div>
        )}

        {/* Danger Zone */}
        <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-semibold text-zinc-300">Account Removal</h3>
            <p className="text-[11px] text-zinc-500">
              Permanently delete your account record from MongoDB.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="px-3 py-1.5 rounded-lg border border-rose-900/60 bg-rose-950/30 hover:bg-rose-950/70 text-rose-300 text-xs font-medium inline-flex items-center space-x-1.5 self-start sm:self-auto transition-colors"
          >
            <Trash2 size={13} />
            <span>Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
