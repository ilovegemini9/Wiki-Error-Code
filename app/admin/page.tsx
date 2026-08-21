import Link from 'next/link';
import { db } from '@/lib/db';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import {
  FileText,
  CheckCircle2,
  FileClock,
  FolderTree,
  Tag,
  Sparkles,
  Plus,
  ArrowRight,
  Search,
  Eye,
  TrendingUp
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardHome() {
  if (!(await isAuthenticatedAdmin())) {
    redirect('/admin/login');
  }

  const stats = db.getDashboardStats();

  return (
    <div className="space-y-6 max-w-6xl">
      
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            ErrorCodeWiki Content Management Overview
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/articles/new"
            className="px-3.5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            + New Article
          </Link>
          <Link
            href="/admin/generate"
            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-600 text-white text-xs font-semibold rounded-xs flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            + Generate with AI
          </Link>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="p-3.5 bg-white border border-gray-300 rounded-xs">
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Articles</div>
          <div className="text-2xl font-serif font-bold text-gray-900 mt-1">{stats.totalArticles}</div>
          <div className="text-[10px] text-gray-400 font-mono mt-1 flex items-center gap-1">
            <FileText className="w-3 h-3 text-gray-500" /> All records
          </div>
        </div>

        <div className="p-3.5 bg-white border border-gray-300 rounded-xs">
          <div className="text-[11px] font-semibold text-green-700 uppercase tracking-wider">Published</div>
          <div className="text-2xl font-serif font-bold text-green-800 mt-1">{stats.publishedArticles}</div>
          <div className="text-[10px] text-green-600 font-mono mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Publicly indexed
          </div>
        </div>

        <div className="p-3.5 bg-white border border-gray-300 rounded-xs">
          <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Drafts</div>
          <div className="text-2xl font-serif font-bold text-amber-800 mt-1">{stats.draftArticles}</div>
          <div className="text-[10px] text-amber-600 font-mono mt-1 flex items-center gap-1">
            <FileClock className="w-3 h-3" /> Pending review
          </div>
        </div>

        <div className="p-3.5 bg-white border border-gray-300 rounded-xs">
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Categories</div>
          <div className="text-2xl font-serif font-bold text-gray-900 mt-1">{stats.categoriesCount}</div>
          <div className="text-[10px] text-gray-400 font-mono mt-1 flex items-center gap-1">
            <FolderTree className="w-3 h-3 text-gray-500" /> Active groups
          </div>
        </div>

        <div className="p-3.5 bg-white border border-gray-300 rounded-xs">
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Brands</div>
          <div className="text-2xl font-serif font-bold text-gray-900 mt-1">{stats.brandsCount}</div>
          <div className="text-[10px] text-gray-400 font-mono mt-1 flex items-center gap-1">
            <Tag className="w-3 h-3 text-gray-500" /> Hardware systems
          </div>
        </div>

        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xs">
          <div className="text-[11px] font-semibold text-blue-900 uppercase tracking-wider">Today&apos;s AI</div>
          <div className="text-2xl font-serif font-bold text-blue-900 mt-1">{stats.todayAiGenerations}</div>
          <div className="text-[10px] text-blue-700 font-mono mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Generated today
          </div>
        </div>

      </div>

      {/* Main Grid: Recent Articles & Recent AI Runs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Articles */}
        <div className="border border-gray-300 bg-white rounded-xs">
          <div className="p-3.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h2 className="font-serif font-bold text-sm text-gray-900">
              Recent Articles
            </h2>
            <Link href="/admin/articles" className="text-xs text-blue-700 hover:underline font-medium">
              View All →
            </Link>
          </div>

          <div className="divide-y divide-gray-200 text-xs">
            {stats.recentArticles.map((art) => (
              <div key={art.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gray-900">{art.errorCode}</span>
                    <span className={`px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-xs ${art.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                      {art.status}
                    </span>
                  </div>
                  <div className="font-serif font-bold text-gray-800 mt-0.5 line-clamp-1">{art.title}</div>
                </div>

                <Link
                  href={`/admin/articles/${art.id}`}
                  className="px-2.5 py-1 border border-gray-300 text-[11px] font-medium text-gray-700 hover:bg-gray-100 rounded-xs"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Recent AI Generations */}
        <div className="border border-gray-300 bg-white rounded-xs">
          <div className="p-3.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h2 className="font-serif font-bold text-sm text-gray-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-700" />
              Recent AI Generations
            </h2>
            <Link href="/admin/generate" className="text-xs text-blue-700 hover:underline font-medium">
              New Generation →
            </Link>
          </div>

          <div className="divide-y divide-gray-200 text-xs">
            {stats.recentAiLogs.length === 0 ? (
              <div className="p-6 text-center text-gray-500 font-mono text-[11px]">
                No AI generations recorded today. Click &quot;Generate with AI&quot; to build an article!
              </div>
            ) : (
              stats.recentAiLogs.map((log) => (
                <div key={log.id} className="p-3 flex items-center justify-between">
                  <div>
                    <div className="font-mono font-bold text-gray-900">{log.errorCode} ({log.brand})</div>
                    <div className="text-[11px] text-gray-500 font-mono">Model: {log.model}</div>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
