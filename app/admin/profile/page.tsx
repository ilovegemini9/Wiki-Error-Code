'use client';

import { ShieldCheck, User } from 'lucide-react';

export default function ProfileAdminPage() {
  return (
    <div className="space-y-6 max-w-2xl text-xs font-sans">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="font-serif text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-6 h-6 text-gray-700" />
          Admin Profile &amp; Security
        </h1>
        <p className="text-xs text-gray-500 font-mono mt-0.5">Administrator access is managed through Vercel server environment variables.</p>
      </div>

      <div className="p-5 bg-white border border-gray-300 rounded-xs space-y-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-700 mt-0.5" />
          <div>
            <h2 className="font-serif font-bold text-sm text-gray-900">Secure authentication configuration</h2>
            <p className="mt-1 text-gray-600 leading-relaxed">
              The admin username/password and session secret are intentionally not editable from the website. Configure
              <code className="mx-1 font-mono">ADMIN_USERNAME</code>,
              <code className="mx-1 font-mono">ADMIN_PASSWORD</code>, and
              <code className="mx-1 font-mono">ADMIN_SESSION_SECRET</code> in Vercel Environment Variables, then redeploy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
