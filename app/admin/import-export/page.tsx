'use client';

import { useState } from 'react';
import { FileUp, Download, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

export default function BulkImportExportPage() {
  const [content, setContent] = useState('');
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ importedCount?: number; errors?: string[] } | null>(null);

  const sampleCsv = `errorCode,title,shortDefinition,meaning,causes,solutions,category,brand
0x80070002,Windows Update Error 0x80070002,File not found during update installation.,The system cannot find the specified file.,Missing updates; Corrupted system files,Run Windows Update Troubleshooter; SFC /scannow,windows,microsoft
P0300,Random Cylinder Misfire Detected,Multiple engine cylinders misfiring.,Engine control unit detected random misfires.,Worn spark plugs; Bad ignition coils,Replace spark plugs; Test fuel injectors,cars,toyota`;

  const sampleJson = `[
  {
    "errorCode": "500",
    "title": "500 Internal Server Error",
    "shortDefinition": "Generic server error message.",
    "meaning": "Unexpected condition encountered by the web server.",
    "causes": "Application syntax errors; Database connection timeouts",
    "solutions": "Check error log; Verify database service running",
    "category": "programming",
    "brand": "cisco"
  }
]`;

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, format })
      });

      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ errors: ['Failed to execute bulk import. Check syntax.'] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl text-xs font-sans">
      
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="font-serif text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileUp className="w-6 h-6 text-gray-700" />
          Bulk Data Import & CSV Engine
        </h1>
        <p className="text-xs text-gray-500 font-mono mt-0.5">
          Import thousands of error codes simultaneously via raw CSV or JSON payloads
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Format guide & Template loader */}
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 border border-gray-300 rounded-xs space-y-3">
            <div className="font-serif font-bold text-sm text-gray-900 border-b border-gray-200 pb-1">
              Import Template Samples
            </div>
            <p className="text-gray-600 leading-relaxed">
              Load pre-formatted templates into the text editor to test bulk database population.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => { setFormat('csv'); setContent(sampleCsv); }}
                className="w-full py-2 px-3 bg-white border border-gray-300 hover:border-blue-600 font-mono text-left rounded-xs flex items-center justify-between"
              >
                <span>Load Sample CSV</span>
                <Download className="w-3.5 h-3.5 text-gray-500" />
              </button>

              <button
                onClick={() => { setFormat('json'); setContent(sampleJson); }}
                className="w-full py-2 px-3 bg-white border border-gray-300 hover:border-blue-600 font-mono text-left rounded-xs flex items-center justify-between"
              >
                <span>Load Sample JSON</span>
                <Download className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Input Textarea & Form */}
        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleImport} className="p-4 bg-white border border-gray-300 rounded-xs space-y-3">
            
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-800">Payload Data Text Input</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('csv')}
                  className={`px-2.5 py-1 font-mono font-bold text-[10px] rounded-xs border ${format === 'csv' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'}`}
                >
                  CSV
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('json')}
                  className={`px-2.5 py-1 font-mono font-bold text-[10px] rounded-xs border ${format === 'json' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'}`}
                >
                  JSON
                </button>
              </div>
            </div>

            <textarea
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste raw CSV or JSON content here..."
              className="w-full font-mono text-xs p-3 border border-gray-300 rounded-xs focus:outline-none focus:ring-1 focus:ring-blue-600 bg-gray-50"
            />

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xs flex items-center gap-2 disabled:opacity-50"
            >
              <FileUp className="w-4 h-4" />
              {loading ? 'Processing Import...' : 'Execute Bulk Import'}
            </button>
          </form>

          {/* Results Display */}
          {result && (
            <div className={`p-4 border rounded-xs ${result.importedCount ? 'bg-green-50 border-green-300 text-green-900' : 'bg-red-50 border-red-300 text-red-900'}`}>
              <div className="font-bold text-sm flex items-center gap-2">
                {result.importedCount ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
                Import Summary
              </div>
              {result.importedCount !== undefined && (
                <p className="mt-1 font-mono">
                  Successfully created/updated {result.importedCount} error code articles!
                </p>
              )}
              {result.errors && result.errors.length > 0 && (
                <div className="mt-2 space-y-1 font-mono text-[11px] text-red-800">
                  {result.errors.map((err, idx) => (
                    <div key={idx}>• {err}</div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
