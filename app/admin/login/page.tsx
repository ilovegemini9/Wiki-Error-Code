'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed');
        setLoading(false);
      } else {
        router.push('/admin');
      }
    } catch {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-100 flex items-center justify-center p-4 font-sans text-gray-900">
      <div className="w-full max-w-sm bg-white border border-gray-300 p-6 rounded-xs shadow-xs space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gray-900 text-white font-serif font-bold text-2xl flex items-center justify-center rounded-xs mx-auto">
            W
          </div>
          <h1 className="font-serif text-xl font-bold text-gray-900">
            ErrorCodeWiki Admin
          </h1>
          <p className="text-xs text-gray-500 font-mono">
            Classic Administrator Sign In
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xs font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-xs font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs rounded-xs flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="pt-2 text-center text-[11px] text-gray-500 border-t border-gray-200">
          <Link href="/" className="text-blue-700 hover:underline">← Back to ErrorCodeWiki Live Site</Link>
        </div>

      </div>
    </div>
  );
}
