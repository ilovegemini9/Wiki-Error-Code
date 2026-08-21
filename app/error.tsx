'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Something went wrong</h1>
      <p className="text-sm text-gray-600 mb-6 max-w-md">
        An unexpected error occurred while loading this manual page.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-xs hover:bg-blue-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
