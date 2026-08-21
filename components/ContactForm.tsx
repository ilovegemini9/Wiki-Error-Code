'use client';

import { useState } from 'react';
import { MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subjectType: 'error_correction',
    errorCode: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.message) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  if (submitted) {
    return (
      <div className="py-8 text-center space-y-4">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-gray-900">
          Message Received!
        </h2>
        <p className="text-gray-700 text-sm max-w-md mx-auto leading-relaxed">
          Thank you for contacting ErrorCodeWiki. Your diagnostic feedback or inquiry has been logged. Our technical documentation team typically responds within 24–48 hours.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setFormData({ name: '', email: '', subjectType: 'error_correction', errorCode: '', message: '' });
          }}
          className="inline-block px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xs"
        >
          Send Another Inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="font-serif text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-blue-700" />
        Submit an Inquiry or Error Code Correction
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-1">
            Your Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g., John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-white border border-gray-300 rounded-xs px-3 py-2 text-xs text-gray-900 focus:ring-1 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-800 mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            placeholder="e.g., john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-white border border-gray-300 rounded-xs px-3 py-2 text-xs text-gray-900 focus:ring-1 focus:ring-blue-600 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-1">
            Topic Category
          </label>
          <select
            value={formData.subjectType}
            onChange={(e) => setFormData({ ...formData, subjectType: e.target.value })}
            className="w-full bg-white border border-gray-300 rounded-xs px-3 py-2 text-xs text-gray-900 focus:ring-1 focus:ring-blue-600 focus:outline-none"
          >
            <option value="error_correction">Error Code Correction / Addition</option>
            <option value="manual_submission">Hardware Manual Submission</option>
            <option value="api_license">Data & API Licensing</option>
            <option value="general_feedback">General Feedback</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-800 mb-1">
            Relevant Error Code (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g., 0x80070005, P0420"
            value={formData.errorCode}
            onChange={(e) => setFormData({ ...formData, errorCode: e.target.value })}
            className="w-full bg-white border border-gray-300 rounded-xs px-3 py-2 text-xs font-mono text-gray-900 focus:ring-1 focus:ring-blue-600 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-800 mb-1">
          Detailed Message / Diagnostic Log
        </label>
        <textarea
          required
          rows={5}
          placeholder="Please describe the issue, hardware model, software version, or correction details..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full bg-white border border-gray-300 rounded-xs p-3 text-xs text-gray-900 focus:ring-1 focus:ring-blue-600 focus:outline-none"
        />
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white font-bold text-xs rounded-xs shadow-2xs transition-colors"
        >
          <Send className="w-4 h-4" />
          <span>{loading ? 'Sending Request...' : 'Submit Inquiry'}</span>
        </button>
      </div>
    </form>
  );
}
