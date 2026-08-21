'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 font-sans flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Application Error</h1>
        <p className="text-sm text-gray-600 mb-6 max-w-md">
          A critical system error occurred.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-xs hover:bg-blue-700 transition-colors"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
