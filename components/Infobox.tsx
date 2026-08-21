import Link from 'next/link';
import { Article } from '@/lib/types';
import { ShieldAlert, Clock, Tag, Cpu, CheckCircle } from 'lucide-react';

export function Infobox({ article, categoryName, brandName }: { article: Article; categoryName: string; brandName: string }) {
  return (
    <aside className="w-full lg:w-80 shrink-0 bg-[#f8f9fa] border border-[#a2a9b1] text-xs font-sans text-gray-800 rounded-xs shadow-2xs my-4 lg:my-0">
      
      {/* Title Header */}
      <div className="bg-[#eaecf0] border-b border-[#a2a9b1] p-2.5 text-center">
        <div className="font-serif font-bold text-sm text-gray-900">
          {article.errorCode}
        </div>
        <div className="text-[11px] text-gray-600 font-mono mt-0.5">
          {brandName} Diagnostic Code
        </div>
      </div>

      {/* Info Rows */}
      <table className="w-full border-collapse text-left">
        <tbody>
          <tr className="border-b border-[#e1e4e8]">
            <th className="p-2 font-semibold bg-[#f1f3f5] w-28 text-gray-700 border-r border-[#e1e4e8]">
              Error Code
            </th>
            <td className="p-2 font-mono font-bold text-blue-900">
              {article.errorCode}
            </td>
          </tr>

          <tr className="border-b border-[#e1e4e8]">
            <th className="p-2 font-semibold bg-[#f1f3f5] text-gray-700 border-r border-[#e1e4e8]">
              Category
            </th>
            <td className="p-2">
              <Link href={`/category/${article.categoryId}`} className="text-blue-700 hover:underline">
                {categoryName}
              </Link>
            </td>
          </tr>

          <tr className="border-b border-[#e1e4e8]">
            <th className="p-2 font-semibold bg-[#f1f3f5] text-gray-700 border-r border-[#e1e4e8]">
              Brand / System
            </th>
            <td className="p-2">
              <Link href={`/brand/${article.brandId}`} className="text-blue-700 hover:underline">
                {brandName}
              </Link>
            </td>
          </tr>

          <tr className="border-b border-[#e1e4e8]">
            <th className="p-2 font-semibold bg-[#f1f3f5] text-gray-700 border-r border-[#e1e4e8]">
              Affected System
            </th>
            <td className="p-2 font-mono text-[11px]">
              {article.deviceType}
            </td>
          </tr>

          <tr className="border-b border-[#e1e4e8]">
            <th className="p-2 font-semibold bg-[#f1f3f5] text-gray-700 border-r border-[#e1e4e8]">
              Status
            </th>
            <td className="p-2">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 text-green-800 text-[10px] font-semibold rounded-xs border border-green-300">
                <CheckCircle className="w-3 h-3 text-green-600" />
                Verified Fix
              </span>
            </td>
          </tr>

          <tr className="border-b border-[#e1e4e8]">
            <th className="p-2 font-semibold bg-[#f1f3f5] text-gray-700 border-r border-[#e1e4e8]">
              Reading Time
            </th>
            <td className="p-2 text-gray-600 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readingTime || '3 min read'}
            </td>
          </tr>

          <tr className="border-b border-[#e1e4e8]">
            <th className="p-2 font-semibold bg-[#f1f3f5] text-gray-700 border-r border-[#e1e4e8]">
              Last Updated
            </th>
            <td className="p-2 font-mono text-[11px] text-gray-600" suppressHydrationWarning>
              {new Date(article.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </td>
          </tr>

          {article.keywords && article.keywords.length > 0 && (
            <tr>
              <th className="p-2 font-semibold bg-[#f1f3f5] text-gray-700 border-r border-[#e1e4e8] align-top">
                Keywords
              </th>
              <td className="p-2 leading-relaxed">
                <div className="flex flex-wrap gap-1">
                  {article.keywords.map((kw, idx) => (
                    <span key={idx} className="bg-gray-200 text-gray-800 px-1 py-0.5 text-[10px] rounded-xs font-mono">
                      {kw}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </aside>
  );
}
