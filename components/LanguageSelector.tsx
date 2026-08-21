'use client';

import { useState, useEffect, useRef } from 'react';
import { useSafeRouter, useSafePathname } from '@/lib/use-safe-router';
import { SUPPORTED_LANGUAGES, getLanguageByCode, detectBrowserLanguage, LanguageOption } from '@/lib/languages';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface LanguageSelectorProps {
  currentLang?: string;
  onLanguageChange?: (langCode: string) => void;
  className?: string;
  compact?: boolean;
}

export function LanguageSelector({ currentLang, onLanguageChange, className = '', compact = false }: LanguageSelectorProps) {
  const [mounted, setMounted] = useState(false);
  const [activeLang, setActiveLang] = useState<string>(currentLang || 'en');
  const [isOpen, setIsOpen] = useState(false);
  const [detectedNotice, setDetectedNotice] = useState<LanguageOption | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useSafeRouter();
  const pathname = useSafePathname();

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let selectedCode = currentLang;

    if (!selectedCode) {
      const safePathname = pathname || '';
      const segments = safePathname.split('/').filter(Boolean);
      if (segments.length > 0 && SUPPORTED_LANGUAGES.some(l => l.code === segments[0].toLowerCase())) {
        selectedCode = segments[0].toLowerCase();
      } else {
        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const paramLang = urlParams?.get('lang');
        if (paramLang && SUPPORTED_LANGUAGES.some(l => l.code === paramLang.toLowerCase())) {
          selectedCode = paramLang.toLowerCase();
        } else {
          selectedCode = detectBrowserLanguage();
          const detected = getLanguageByCode(selectedCode);
          if (detected.code !== 'en' && typeof window !== 'undefined' && !localStorage.getItem('lang_dismissed')) {
            setTimeout(() => {
              setDetectedNotice(detected);
            }, 0);
          }
        }
      }
    }

    const validLang = getLanguageByCode(selectedCode || 'en');
    setTimeout(() => {
      setActiveLang(validLang.code);
    }, 0);
  }, [mounted, currentLang, pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (langCode: string) => {
    setActiveLang(langCode);
    setIsOpen(false);
    setDetectedNotice(null);

    if (typeof window !== 'undefined') {
      localStorage.setItem('user_lang', langCode);
    }

    if (onLanguageChange) {
      onLanguageChange(langCode);
      return;
    }

    const safePath = pathname || '';
    const segments = safePath.split('/').filter(Boolean);
    const hasLangPrefix = segments.length > 0 && SUPPORTED_LANGUAGES.some(l => l.code === segments[0].toLowerCase());

    const navigateTo = (url: string) => {
      if (router) {
        router.push(url);
      } else if (typeof window !== 'undefined') {
        window.location.href = url;
      }
    };

    if (hasLangPrefix) {
      if (langCode === 'en') {
        const remainingPath = '/' + segments.slice(1).join('/');
        navigateTo(remainingPath || '/');
      } else {
        segments[0] = langCode;
        navigateTo('/' + segments.join('/'));
      }
    } else {
      const currentPath = pathname || '/';
      const searchStr = typeof window !== 'undefined' ? window.location.search : '';
      const newParams = new URLSearchParams(searchStr);

      if (langCode === 'en') {
        newParams.delete('lang');
        const qs = newParams.toString();
        navigateTo(`${currentPath}${qs ? `?${qs}` : ''}`);
      } else {
        if (currentPath.startsWith('/category/') || currentPath.startsWith('/error/') || currentPath.startsWith('/brand/') || currentPath === '/') {
          const targetPath = currentPath === '/' ? `/${langCode}` : `/${langCode}${currentPath}`;
          navigateTo(targetPath);
        } else {
          newParams.set('lang', langCode);
          navigateTo(`${currentPath}?${newParams.toString()}`);
        }
      }
    }
  };

  const activeOption = getLanguageByCode(activeLang);

  if (!mounted) {
    return (
      <div className={`relative inline-block text-left ${className}`}>
        <div className="w-24 h-8 bg-gray-100 rounded-xs border border-gray-200 animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {detectedNotice && (
        <div className="absolute right-0 top-10 w-72 bg-gray-900 text-white p-3 rounded-xs shadow-xl border border-blue-500 z-50 text-xs font-sans">
          <div className="flex items-center justify-between">
            <span className="font-bold text-blue-400 text-[11px] uppercase tracking-wider flex items-center gap-1">
              <span>Language Detected</span>
            </span>
            <button
              onClick={() => setDetectedNotice(null)}
              className="text-gray-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
          <p className="mt-1.5 text-gray-200 text-[11px] leading-snug">
            Your browser is set to <strong className="text-white">{detectedNotice.name}</strong> ({detectedNotice.flag}). Switch to view manuals in your language?
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSelect(detectedNotice.code)}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xs text-[11px] flex items-center gap-1 transition-colors"
            >
              <span>{detectedNotice.flag} Switch to {detectedNotice.name}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setDetectedNotice(null);
                if (typeof window !== 'undefined') localStorage.setItem('lang_dismissed', 'true');
              }}
              className="px-2 py-1 text-gray-400 hover:text-gray-200 text-[11px]"
            >
              Keep English
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 border rounded-xs font-mono transition-colors focus:outline-none ${
          compact
            ? 'px-2 py-1 bg-white hover:bg-gray-100 border-gray-300 text-gray-800 text-xs'
            : 'px-2.5 py-1.5 bg-gray-50 hover:bg-white border-gray-300 hover:border-blue-600 text-gray-900 text-xs font-medium shadow-2xs'
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="text-base leading-none">{activeOption.flag}</span>
        <span className="font-bold text-gray-900 uppercase tracking-wider">{activeOption.code}</span>
        <span className="hidden sm:inline text-gray-600 text-[11px] font-sans">({activeOption.name})</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-500 shrink-0 ml-0.5" />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-1 w-56 rounded-xs shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-50 border border-gray-300 py-1">
          <div className="px-3 py-1.5 bg-gray-50 text-[10px] uppercase font-mono font-bold text-gray-500 border-b border-gray-200 flex items-center gap-1">
            <Globe className="w-3 h-3 text-blue-700" />
            <span>Select Manual Language</span>
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = activeLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-blue-50 transition-colors ${
                    isSelected ? 'bg-blue-50/80 font-bold text-blue-900' : 'text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg leading-none">{lang.flag}</span>
                    <div>
                      <span className="font-semibold block leading-snug">{lang.name}</span>
                      <span className="text-[10px] text-gray-500 font-mono block -mt-0.5">{lang.englishName}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-700 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
