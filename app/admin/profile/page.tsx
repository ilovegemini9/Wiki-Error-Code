'use client';

import { useState } from 'react';
import { User, Save, Lock, Check, AlertCircle } from 'lucide-react';

export default function ProfileAdminPage() {
  const [username, setUsername] = useState('admin');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'New passwords do not match' });
      return;
    }

    setStatus({ type: 'success', message: 'Admin Profile settings updated successfully!' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6 max-w-2xl text-xs font-sans">
      
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="font-serif text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-6 h-6 text-gray-700" />
          Admin Profile & Security
        </h1>
        <p className="text-xs text-gray-500 font-mono mt-0.5">
          Manage administrator account credentials and access
        </p>
      </div>

      {status && (
        <div className={`p-3 border rounded-xs flex items-center gap-2 ${status.type === 'success' ? 'bg-green-50 border-green-300 text-green-900' : 'bg-red-50 border-red-300 text-red-900'}`}>
          {status.type === 'success' ? <Check className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          <span>{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-5 bg-white border border-gray-300 rounded-xs space-y-4">
        
        <div>
          <label className="block font-bold text-gray-800 mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 p-2 font-mono rounded-xs"
            required
          />
        </div>

        <div className="pt-2 border-t border-gray-200 space-y-3">
          <div className="font-serif font-bold text-sm text-gray-900">
            Change Password
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-gray-300 p-2 font-mono rounded-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 p-2 font-mono rounded-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 p-2 font-mono rounded-xs"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xs flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Update Credentials
        </button>

      </form>

    </div>
  );
}
