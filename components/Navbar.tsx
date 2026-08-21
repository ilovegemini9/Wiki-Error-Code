'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSafeRouter } from '@/lib/use-safe-router';
import { Search, Menu, X, ShieldAlert } from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';

export function Navbar() {
  const [query, setQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useSafeRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (router) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      } else if (typeof window !== 'undefined') {
        window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
      }
    }
  };

  return (
    <header className="bg-white border-b border-gray-300 sticky top-0 z-40 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 bg-gray-900 text-white flex items-center justify-center font-serif text-xl font-bold rounded-xs shadow-xs border border-gray-800">
              W
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-tight text-gray-900 group-hover:text-blue-700">
                ErrorCodeWiki
              </span>
              <span className="block text-[10px] uppercase font-mono tracking-wider text-gray-500 font-semibold -mt-1">
                The Free Diagnostic Manual
              </span>
            </div>
          </Link>

          {/* Search Bar - Main */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search by code (e.g., 0x80070005, E-01, P0420, 404)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xs pl-3.5 pr-10 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white focus:border-blue-600 transition-all font-mono"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 bottom-0 px-3 bg-gray-100 hover:bg-gray-200 border-l border-gray-300 text-gray-700 flex items-center justify-center rounded-r-xs"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Nav Links & Language Selector */}
          <nav className="hidden lg:flex items-center gap-4 text-sm font-sans font-medium text-gray-700">
            <Link href="/" className="hover:text-blue-700 transition-colors">
              Explore
            </Link>
            <Link href="/category/windows" className="hover:text-blue-700 transition-colors">
              Windows
            </Link>
            <Link href="/category/printers" className="hover:text-blue-700 transition-colors">
              Printers
            </Link>
            <Link href="/category/cars" className="hover:text-blue-700 transition-colors">
              Cars
            </Link>
            <Link href="/category/gaming" className="hover:text-blue-700 transition-colors">
              Gaming
            </Link>

            {/* Language Selector */}
            <div className="border-l border-gray-200 pl-3 shrink-0">
              <Suspense fallback={<div className="w-24 h-8 bg-gray-100 animate-pulse rounded-xs" />}>
                <LanguageSelector />
              </Suspense>
            </div>

            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-mono font-medium rounded-xs hover:bg-gray-800 transition-colors shrink-0"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Admin
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 pt-1 md:hidden">
          <form onSubmit={handleSearch} className="flex">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search error code (e.g. 0x80070005, P0420)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xs pl-3 pr-10 py-2 font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 bottom-0 px-3 bg-gray-100 border-l border-gray-300 text-gray-700 flex items-center justify-center"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-300 px-4 pt-2 pb-4 space-y-2 text-sm">
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2 text-gray-800 hover:text-blue-700 border-b border-gray-100"
          >
            Home
          </Link>
          <Link
            href="/category/windows"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2 text-gray-800 hover:text-blue-700 border-b border-gray-100"
          >
            Windows Errors
          </Link>
          <Link
            href="/category/printers"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2 text-gray-800 hover:text-blue-700 border-b border-gray-100"
          >
            Printer Errors (Canon, Epson, HP, Brother)
          </Link>
          <Link
            href="/category/cars"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2 text-gray-800 hover:text-blue-700 border-b border-gray-100"
          >
            Car OBD2 Trouble Codes (Toyota, BMW, Mercedes)
          </Link>
          <Link
            href="/category/gaming"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2 text-gray-800 hover:text-blue-700 border-b border-gray-100"
          >
            Gaming Console Errors (PS5, Xbox, Switch)
          </Link>
          <Link
            href="/category/programming"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2 text-gray-800 hover:text-blue-700 border-b border-gray-100"
          >
            HTTP & Programming Exceptions
          </Link>
          <div className="pt-2 pb-1 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600">Manual Language:</span>
            <Suspense fallback={<div className="w-20 h-7 bg-gray-100 animate-pulse rounded-xs" />}>
              <LanguageSelector compact />
            </Suspense>
          </div>
          <Link
            href="/admin/login"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2 text-blue-700 font-semibold"
          >
            Admin Dashboard Login
          </Link>
        </div>
      )}
    </header>
  );
}
