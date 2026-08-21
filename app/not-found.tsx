import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
        404 - Page Not Found
      </h1>

      <p className="text-lg text-gray-600 max-w-md mb-8">
        The error code manual or diagnostic page you are looking for does not exist or has been moved.
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-md hover:bg-blue-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Homepage
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 font-medium text-sm rounded-md hover:bg-gray-200 transition"
        >
          <Search className="w-4 h-4" />
          Search Error Codes
        </Link>
      </div>
    </div>
  );
}

