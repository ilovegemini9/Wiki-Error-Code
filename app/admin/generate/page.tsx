'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Category, Brand, Article } from '@/lib/types';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '@/lib/languages';
import { Sparkles, Save, CheckCircle2, RefreshCw, Copy, Check, AlertCircle, Wand2, Lightbulb, Zap, ExternalLink, Globe, Play, Square, Settings2, Clock, Cpu, Radio, ListChecks } from 'lucide-react';

// Master Pool of Popular Error Code Presets
const MASTER_PRESET_CODES = [
  { code: '0x80070005', label: '0x80070005 (Windows)', brand: 'Microsoft', device: 'Windows 11 PC', cat: 'windows' },
  { code: 'P0420', label: 'P0420 (Cat Efficiency)', brand: 'Toyota', device: 'OBD-II Scanner', cat: 'automotive' },
  { code: 'E-01', label: 'E-01 (Ink Pad Reset)', brand: 'Epson', device: 'EcoTank Printer', cat: 'printers' },
  { code: 'CE-34878-0', label: 'CE-34878-0 (App Crash)', brand: 'Sony PlayStation', device: 'PS5 Console', cat: 'gaming' },
  { code: 'E24', label: 'E24 (Drain Fault)', brand: 'Bosch', device: 'Dishwasher', cat: 'appliances' },
  { code: 'ERR_CONNECTION_REFUSED', label: 'ERR_CONN_REFUSED', brand: 'Google Chrome', device: 'Chrome Browser', cat: 'software' },
  { code: '0x80070422', label: '0x80070422 (Update Service)', brand: 'Microsoft', device: 'Windows Update Service', cat: 'windows' },
  { code: 'P0300', label: 'P0300 (Engine Misfire)', brand: 'Honda / Ford', device: 'Engine Ignition', cat: 'automotive' },
  { code: '5100', label: '5100 (Carriage Jam)', brand: 'Canon', device: 'PIXMA Printer', cat: 'printers' },
  { code: '0x800f081f', label: '0x800f081f (DISM Source)', brand: 'Microsoft', device: 'Windows 11 OS', cat: 'windows' },
  { code: 'P0171', label: 'P0171 (System Lean)', brand: 'Chevrolet', device: 'Fuel Injection', cat: 'automotive' },
  { code: 'CRITICAL_PROCESS_DIED', label: 'CRITICAL_PROCESS_DIED', brand: 'Microsoft', device: 'Windows BSOD', cat: 'windows' },
  { code: '79', label: '79 Error (Laser Firmware)', brand: 'HP', device: 'LaserJet Printer', cat: 'printers' },
  { code: '0x8027025a', label: '0x8027025a (Xbox Start)', brand: 'Microsoft Xbox', device: 'Xbox Series X', cat: 'gaming' },
  { code: 'F06', label: 'F06 (Motor Tachometer)', brand: 'Whirlpool', device: 'Front-Load Washer', cat: 'appliances' },
  { code: '502_BAD_GATEWAY', label: '502 Bad Gateway', brand: 'Nginx / Cloudflare', device: 'Web Server', cat: 'software' },
  { code: 'P0455', label: 'P0455 (EVAP Large Leak)', brand: 'Nissan / Ford', device: 'EVAP System', cat: 'automotive' },
  { code: 'E15', label: 'E15 (Base Water Leak)', brand: 'Bosch', device: 'Dishwasher', cat: 'appliances' },
  { code: '2168-0002', label: '2168-0002 (System Crash)', brand: 'Nintendo Switch', device: 'Switch Console', cat: 'gaming' },
  { code: '4E', label: '4E (Water Supply Error)', brand: 'Samsung', device: 'Washing Machine', cat: 'appliances' },
  { code: 'B200', label: 'B200 (Printhead Hot)', brand: 'Canon', device: 'PIXMA Inkjet', cat: 'printers' },
  { code: '0x80070057', label: '0x80070057 (Invalid Param)', brand: 'Microsoft', device: 'Windows Storage', cat: 'windows' },
  { code: 'P0128', label: 'P0128 (Thermostat Temp)', brand: 'Subaru / Toyota', device: 'Cooling System', cat: 'automotive' },
  { code: 'DNS_PROBE_FINISHED_NXDOMAIN', label: 'DNS_PROBE_NXDOMAIN', brand: 'Google Chrome', device: 'DNS Resolution', cat: 'software' },
  { code: 'E3', label: 'E3 (Paper Jam / Door)', brand: 'Brother', device: 'Laser Printer', cat: 'printers' },
  { code: 'WS-37397-9', label: 'WS-37397-9 (PSN Block)', brand: 'Sony PlayStation', device: 'PSN Network', cat: 'gaming' },
  { code: 'LE', label: 'LE (Motor Lock Fault)', brand: 'LG', device: 'DirectDrive Washer', cat: 'appliances' },
  { code: '504_GATEWAY_TIMEOUT', label: '504 Gateway Timeout', brand: 'AWS / Cloudflare', device: 'Reverse Proxy', cat: 'software' },
  { code: 'P0700', label: 'P0700 (Trans Malfunction)', brand: 'Dodge / Jeep', device: 'Automatic Transmission', cat: 'automotive' },
  { code: '50.2', label: '50.2 (Fuser Error)', brand: 'HP', device: 'LaserJet Pro', cat: 'printers' },
  { code: 'E102', label: 'E102 (Startup Error)', brand: 'Microsoft Xbox', device: 'Xbox One S', cat: 'gaming' },
  { code: '403_FORBIDDEN', label: '403 Forbidden Access', brand: 'Apache / Nginx', device: 'Web Server', cat: 'software' },
];

export default function AiGeneratorPage() {
  const router = useRouter();

  // Mode: manual or auto
  const [generationMode, setGenerationMode] = useState<'manual' | 'auto'>('manual');

  // Form Fields
  const [errorCode, setErrorCode] = useState('');
  const [brand, setBrand] = useState('Microsoft');
  const [device, setDevice] = useState('Windows 11 PC');
  const [category, setCategory] = useState('windows');
  const [language, setLanguage] = useState('English');
  const [keywords, setKeywords] = useState('');
  const [articleLength, setArticleLength] = useState('Medium (800 words)');
  const [model, setModel] = useState('auto_cascade');
  const [temperature, setTemperature] = useState(0.7);

  // Lists & Preset Filtering
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [existingArticles, setExistingArticles] = useState<Article[]>([]);
  const [presetCategoryFilter, setPresetCategoryFilter] = useState<string>('all');

  // State
  const [loading, setLoading] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [copied, setCopied] = useState(false);
  const [presetIndex, setPresetIndex] = useState(0);

  // Automation Engine State
  const [isAutomationActive, setIsAutomationActive] = useState(false);
  const [automationIntervalMinutes, setAutomationIntervalMinutes] = useState<number>(1); // 1 min, 60 (1h), 300 (5h), 1440 (24h)
  const [automationLanguages, setAutomationLanguages] = useState<string[]>(['en', 'fr', 'es']);
  const [automationPublishStatus, setAutomationPublishStatus] = useState<'published' | 'draft'>('published');
  const [automationLogs, setAutomationLogs] = useState<Array<{ id: string; time: string; text: string; type: 'info' | 'success' | 'error' }>>([]);
  const [automationCount, setAutomationCount] = useState<number>(0);
  const [secondsUntilNext, setSecondsUntilNext] = useState<number>(0);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);

  // AI Suggestions
  const [aiSuggestions, setAiSuggestions] = useState<{
    brand?: string;
    device?: string;
    category?: string;
    keywords?: string[];
    brands?: string[];
    devices?: string[];
    suggestedTitle?: string;
    suggestedOutline?: string[];
    existingArticle?: { id: string; title: string; slug: string; status: string } | null;
  } | null>(null);

  // Generated Output Article
  const [generatedArticle, setGeneratedArticle] = useState<Partial<Article> | null>(null);

  // Load initial datasets on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [artRes, catRes, brandRes, setRes] = await Promise.all([
          fetch('/api/admin/articles'),
          fetch('/api/admin/categories'),
          fetch('/api/admin/brands'),
          fetch('/api/admin/settings')
        ]);
        const artData = await artRes.json();
        const catData = await catRes.json();
        const brandData = await brandRes.json();
        const setData = await setRes.json();
        
        if (artData.articles) setExistingArticles(artData.articles);
        if (catData.categories) setCategories(catData.categories);
        if (brandData.brands) setBrands(brandData.brands);
        if (setData.settings) {
          const s = setData.settings;
          if (s.automationActive) {
            setIsAutomationActive(true);
            setGenerationMode('auto');
          }
          if (s.automationIntervalMinutes) setAutomationIntervalMinutes(s.automationIntervalMinutes);
          if (s.automationLanguages && s.automationLanguages.length > 0) setAutomationLanguages(s.automationLanguages);
          if (s.automationPublishStatus) setAutomationPublishStatus(s.automationPublishStatus);
          if (s.automationLogs) setAutomationLogs(s.automationLogs);
          if (s.automationCount !== undefined) setAutomationCount(s.automationCount);
        }
      } catch (e) {
        console.error('Failed to load initial admin data', e);
      }
    };
    fetchInitialData();
  }, []);

  // Poll server settings periodically to sync background logs and status
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.settings) {
          const s = data.settings;
          if (s.automationActive !== undefined) setIsAutomationActive(s.automationActive);
          if (s.automationLogs) setAutomationLogs(s.automationLogs);
          if (s.automationCount !== undefined) setAutomationCount(s.automationCount);
        }
      } catch {
        // Ignore polling errors
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Filter out any error codes that already exist in database
  const uncreatedPresets = useMemo(() => {
    return MASTER_PRESET_CODES.filter(preset => {
      if (presetCategoryFilter !== 'all' && preset.cat !== presetCategoryFilter) {
        return false;
      }
      const cleanPresetCode = preset.code.toLowerCase().replace(/[^a-z0-9]/g, '');
      return !existingArticles.some(art => {
        const cleanArtCode = art.errorCode.toLowerCase().replace(/[^a-z0-9]/g, '');
        return cleanArtCode === cleanPresetCode;
      });
    });
  }, [existingArticles, presetCategoryFilter]);

  // Display top 8 uncreated presets (with cycle offset support)
  const visiblePresets = useMemo(() => {
    if (uncreatedPresets.length === 0) return [];
    if (uncreatedPresets.length <= 8) return uncreatedPresets;
    
    const start = presetIndex % uncreatedPresets.length;
    const end = start + 8;
    if (end <= uncreatedPresets.length) {
      return uncreatedPresets.slice(start, end);
    }
    return [...uncreatedPresets.slice(start), ...uncreatedPresets.slice(0, end - uncreatedPresets.length)];
  }, [uncreatedPresets, presetIndex]);

  const handleShufflePresets = () => {
    setPresetIndex(prev => prev + 8);
  };

  // Dynamic Brand Pills based on selected error code or AI suggestions
  const dynamicBrandPills = useMemo(() => {
    if (aiSuggestions?.brands && aiSuggestions.brands.length > 0) {
      return Array.from(new Set([brand, ...aiSuggestions.brands])).filter(Boolean).slice(0, 6);
    }
    const clean = errorCode.toLowerCase().trim();
    if (clean.startsWith('p0') || clean.startsWith('p1') || clean.startsWith('b0') || clean.startsWith('c0')) {
      return ['Toyota', 'Ford', 'Honda', 'Chevrolet', 'Subaru', 'Nissan'];
    }
    if (clean.startsWith('e-') || clean.includes('ink') || clean.includes('paper') || clean.startsWith('5100') || clean.startsWith('b200') || clean.startsWith('50.')) {
      return ['Canon', 'Epson', 'HP', 'Brother', 'Lexmark'];
    }
    if (clean.startsWith('ce-') || clean.startsWith('ws-') || clean.startsWith('e102') || clean.startsWith('2168')) {
      return ['Sony PlayStation', 'Microsoft Xbox', 'Nintendo Switch'];
    }
    if (clean.startsWith('e15') || clean.startsWith('e24') || clean.startsWith('f06') || clean.startsWith('4e') || clean.startsWith('le')) {
      return ['Bosch', 'Samsung', 'Whirlpool', 'LG'];
    }
    if (clean.startsWith('err_') || clean.includes('500') || clean.includes('502') || clean.includes('504') || clean.includes('403') || clean.includes('404')) {
      return ['Google Chrome', 'Nginx', 'Apache', 'Cloudflare', 'AWS'];
    }
    return ['Microsoft', 'Apple', 'Toyota', 'Canon', 'Sony', 'Bosch'];
  }, [errorCode, brand, aiSuggestions]);

  // Dynamic Device Pills based on selected error code or AI suggestions
  const dynamicDevicePills = useMemo(() => {
    if (aiSuggestions?.devices && aiSuggestions.devices.length > 0) {
      return Array.from(new Set([device, ...aiSuggestions.devices])).filter(Boolean).slice(0, 6);
    }
    const clean = errorCode.toLowerCase().trim();
    if (clean.startsWith('p0') || clean.startsWith('p1') || clean.startsWith('b0') || clean.startsWith('c0')) {
      return ['OBD-II Scanner', 'Engine ECU', 'Ignition System', 'Cooling System'];
    }
    if (clean.startsWith('e-') || clean.includes('ink') || clean.includes('paper') || clean.startsWith('5100') || clean.startsWith('b200') || clean.startsWith('50.')) {
      return ['InkJet Printer', 'EcoTank Printer', 'PIXMA Inkjet', 'LaserJet Pro'];
    }
    if (clean.startsWith('ce-') || clean.startsWith('ws-') || clean.startsWith('e102') || clean.startsWith('2168')) {
      return ['PS5 Console', 'Xbox Series X', 'Nintendo Switch'];
    }
    if (clean.startsWith('e15') || clean.startsWith('e24') || clean.startsWith('f06') || clean.startsWith('4e') || clean.startsWith('le')) {
      return ['Dishwasher', 'Front-Load Washer', 'Dryer', 'Refrigerator'];
    }
    if (clean.startsWith('err_') || clean.includes('500') || clean.includes('502') || clean.includes('504') || clean.includes('403') || clean.includes('404')) {
      return ['Chrome Browser', 'Web Server', 'Reverse Proxy', 'DNS Resolution'];
    }
    return ['Windows 11 PC', 'OBD-II Scanner', 'InkJet Printer', 'PS5 Console'];
  }, [errorCode, device, aiSuggestions]);

  // Dynamic Category Pills based on error code
  const dynamicCategoryPills = useMemo(() => {
    if (categories.length > 0) return categories.slice(0, 6);
    return [
      { id: '1', name: 'Windows', slug: 'windows' },
      { id: '2', name: 'Automotive', slug: 'automotive' },
      { id: '3', name: 'Printers', slug: 'printers' },
      { id: '4', name: 'Gaming', slug: 'gaming' },
      { id: '5', name: 'Appliances', slug: 'appliances' },
      { id: '6', name: 'Software', slug: 'software' }
    ] as Category[];
  }, [categories]);

  // Derived duplicate match
  const existingMatch = useMemo(() => {
    if (!errorCode.trim()) return null;
    const clean = errorCode.toLowerCase().replace(/[^a-z0-9]/g, '');
    const match = existingArticles.find(
      a => a.errorCode.toLowerCase().replace(/[^a-z0-9]/g, '') === clean
    );
    if (match) {
      return {
        id: match.id,
        title: match.title,
        slug: match.slug,
        status: match.status
      };
    }
    return aiSuggestions?.existingArticle || null;
  }, [errorCode, existingArticles, aiSuggestions]);

  // Handle Error Code Text Changes & Auto-Detect context
  const handleErrorCodeInputChange = (val: string) => {
    setErrorCode(val);
    const clean = val.toLowerCase().trim();
    if (!clean) return;

    const preset = MASTER_PRESET_CODES.find(p => p.code.toLowerCase() === clean);
    if (preset) {
      setBrand(preset.brand);
      setDevice(preset.device);
      setCategory(preset.cat);
    } else if (clean.startsWith('p0') || clean.startsWith('p1')) {
      setBrand('Toyota');
      setDevice('OBD-II Scanner');
      setCategory('automotive');
    } else if (clean.startsWith('e-') || clean.startsWith('5100') || clean.startsWith('b200')) {
      setBrand('Canon');
      setDevice('InkJet Printer');
      setCategory('printers');
    } else if (clean.startsWith('ce-') || clean.startsWith('ws-')) {
      setBrand('Sony PlayStation');
      setDevice('PS5 Console');
      setCategory('gaming');
    } else if (clean.startsWith('e15') || clean.startsWith('e24') || clean.startsWith('f06')) {
      setBrand('Bosch');
      setDevice('Dishwasher');
      setCategory('appliances');
    } else if (clean.startsWith('err_') || clean.includes('500') || clean.includes('502') || clean.includes('404')) {
      setBrand('Google Chrome');
      setDevice('Chrome Browser');
      setCategory('software');
    } else if (clean.startsWith('0x')) {
      setBrand('Microsoft');
      setDevice('Windows 11 PC');
      setCategory('windows');
    }
  };

  // Fetch AI Suggestions for all fields
  const handleFetchAiSuggestions = async (overrideCode?: string, autofill = false, overrideLang?: string) => {
    const codeToUse = overrideCode || errorCode;
    const langToUse = overrideLang || language;
    if (!codeToUse.trim()) {
      setError('Please enter an error code first to get AI suggestions');
      return;
    }

    setSuggesting(true);
    setError('');

    try {
      const res = await fetch('/api/admin/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorCode: codeToUse,
          brand,
          device,
          category,
          language: langToUse,
          model
        })
      });

      const data = await res.json();
      if (data.success && data.suggestions) {
        setAiSuggestions(data.suggestions);

        if (data.allCategories) setCategories(data.allCategories);
        if (data.allBrands) setBrands(data.allBrands);

        if (autofill) {
          if (data.suggestions.brand) setBrand(data.suggestions.brand);
          if (data.suggestions.device) setDevice(data.suggestions.device);
          if (data.suggestions.category) setCategory(data.suggestions.category);
          if (data.suggestions.keywords && data.suggestions.keywords.length > 0) {
            setKeywords(data.suggestions.keywords.join(', '));
          }
        }
      }
    } catch {
      // Fallback
    } finally {
      setSuggesting(false);
    }
  };

  const handleSelectPreset = (preset: typeof MASTER_PRESET_CODES[0]) => {
    setSuccessNotice('');
    setErrorCode(preset.code);
    setBrand(preset.brand);
    setDevice(preset.device);
    setCategory(preset.cat);
    handleFetchAiSuggestions(preset.code, true);
  };

  const handleToggleKeywordTag = (tag: string) => {
    const existing = keywords.split(',').map(k => k.trim()).filter(Boolean);
    if (existing.includes(tag)) {
      setKeywords(existing.filter(k => k !== tag).join(', '));
    } else {
      setKeywords([...existing, tag].join(', '));
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!errorCode.trim()) {
      setError('Please enter an error code');
      return;
    }

    setError('');
    setSuccessNotice('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorCode,
          brand,
          device,
          category,
          language,
          keywords,
          articleLength,
          model,
          temperature
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'AI Generation failed');
      } else {
        setGeneratedArticle(data.article);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!generatedArticle) return;

    const selectedCategory = categories.find(c => c.slug === category || c.id === category);
    const selectedBrand = brands.find(b => b.name.toLowerCase() === brand.toLowerCase() || b.id === brand.toLowerCase());

    const savedCode = generatedArticle.errorCode || errorCode;
    const langCode = getLanguageByCode(generatedArticle.language || language).code;

    const payload = {
      ...generatedArticle,
      language: langCode,
      categoryId: selectedCategory?.id || category,
      brandId: selectedBrand?.id || brand,
      deviceType: device || generatedArticle.deviceType || 'General Device',
      status
    };

    try {
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        if (data.article) {
          setExistingArticles(prev => {
            const next = [...prev, data.article];
            try {
              localStorage.setItem('errorcodewiki_articles_backup_v1', JSON.stringify(next));
            } catch {}
            return next;
          });
        }
        setSuccessNotice(`✅ Article for "${savedCode}" successfully saved as ${status}! It has been removed from Quick AI Picks.`);
        setGeneratedArticle(null);
        setErrorCode('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert(data.error || 'Failed to save article.');
      }
    } catch {
      alert('Error saving article.');
    }
  };

  const handleCopy = () => {
    if (!generatedArticle) return;
    navigator.clipboard.writeText(JSON.stringify(generatedArticle, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // SINGLE AUTOMATED GENERATION STEP EXECUTION
  const runAutomatedGenerationStep = async () => {
    if (isAutoGenerating) return;
    setIsAutoGenerating(true);

    const nowStr = new Date().toLocaleTimeString();

    // 1. Pick candidates
    const candidates = uncreatedPresets.length > 0 ? uncreatedPresets : MASTER_PRESET_CODES;
    const pickedPreset = candidates[Math.floor(Math.random() * candidates.length)];
    
    // 2. Pick random target language from selected automation languages array
    const langCode = automationLanguages[Math.floor(Math.random() * automationLanguages.length)] || 'en';
    const langObj = getLanguageByCode(langCode);

    setAutomationLogs(prev => [
      {
        id: String(Date.now()),
        time: nowStr,
        text: `🤖 [AUTO ENGINE] Generating & Publishing: "${pickedPreset.code}" (${pickedPreset.brand}) in ${langObj.flag} ${langObj.name}...`,
        type: 'info'
      },
      ...prev.slice(0, 49)
    ]);

    try {
      // Step A: Dynamic AI Auto-Fill / Suggestion resolution in target language
      let targetBrand = pickedPreset.brand;
      let targetDevice = pickedPreset.device;
      let targetCat = pickedPreset.cat;
      let targetKeywords = `${pickedPreset.code} fix, diagnostic manual, troubleshooting`;

      try {
        const suggestRes = await fetch('/api/admin/ai-suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            errorCode: pickedPreset.code,
            brand: pickedPreset.brand,
            device: pickedPreset.device,
            category: pickedPreset.cat,
            language: langObj.code,
            model
          })
        });
        const suggestData = await suggestRes.json();
        if (suggestData.success && suggestData.suggestions) {
          if (suggestData.suggestions.brand) targetBrand = suggestData.suggestions.brand;
          if (suggestData.suggestions.device) targetDevice = suggestData.suggestions.device;
          if (suggestData.suggestions.category) targetCat = suggestData.suggestions.category;
          if (suggestData.suggestions.keywords && suggestData.suggestions.keywords.length > 0) {
            targetKeywords = suggestData.suggestions.keywords.join(', ');
          }
        }
      } catch {
        // Fallback to preset values
      }

      // Step B: Generate complete SEO article natively in target language
      const genRes = await fetch('/api/admin/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorCode: pickedPreset.code,
          brand: targetBrand,
          device: targetDevice,
          category: targetCat,
          language: langObj.englishName,
          keywords: targetKeywords,
          articleLength: 'Comprehensive (1200+ words)',
          model,
          temperature
        })
      });

      const genData = await genRes.json();
      if (!genRes.ok || !genData.article) {
        throw new Error(genData.error || 'Generation error');
      }

      // Step C: Auto-Publish directly to Database (Auto-registers category/brand/device if missing)
      const saveRes = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...genData.article,
          language: langObj.code,
          categoryId: targetCat,
          brandId: targetBrand,
          deviceType: targetDevice,
          status: automationPublishStatus
        })
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok) {
        throw new Error(saveData.error || 'Failed to publish');
      }

      if (saveData.article) {
        setExistingArticles(prev => {
          const next = [...prev, saveData.article];
          try {
            localStorage.setItem('errorcodewiki_articles_backup_v1', JSON.stringify(next));
          } catch {}
          return next;
        });
      }

      // Refresh Categories & Brands in state so new items show up immediately
      try {
        const [cRes, bRes] = await Promise.all([
          fetch('/api/admin/categories'),
          fetch('/api/admin/brands')
        ]);
        const cData = await cRes.json();
        const bData = await bRes.json();
        if (cData.categories) setCategories(cData.categories);
        if (bData.brands) setBrands(bData.brands);
      } catch {
        // Ignore refresh error
      }

      setAutomationCount(prev => prev + 1);
      const finishStr = new Date().toLocaleTimeString();
      setAutomationLogs(prev => [
        {
          id: String(Date.now() + 1),
          time: finishStr,
          text: `✅ [AUTO PUBLISHED] "${genData.article.title}" (${langObj.flag} ${langObj.code.toUpperCase()}) created & published to database!`,
          type: 'success'
        },
        ...prev.slice(0, 49)
      ]);
    } catch (err: unknown) {
      const errStr = new Date().toLocaleTimeString();
      const msg = err instanceof Error ? err.message : 'Automation failure';
      setAutomationLogs(prev => [
        {
          id: String(Date.now() + 2),
          time: errStr,
          text: `❌ [AUTOMATION ERROR] ${msg}`,
          type: 'error'
        },
        ...prev.slice(0, 49)
      ]);
    } finally {
      setIsAutoGenerating(false);
    }
  };

  const autoStepRef = useRef(runAutomatedGenerationStep);
  useEffect(() => {
    autoStepRef.current = runAutomatedGenerationStep;
  });

  // AUTOMATION ENGINE LOOP EFFECT
  useEffect(() => {
    if (!isAutomationActive) return;

    const timer = setInterval(() => {
      setSecondsUntilNext(prev => {
        if (prev <= 1) {
          autoStepRef.current();
          return automationIntervalMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutomationActive, automationIntervalMinutes]);

  const handleToggleAutomationLanguage = (code: string) => {
    if (automationLanguages.includes(code)) {
      if (automationLanguages.length <= 1) return; // Keep at least one
      setAutomationLanguages(automationLanguages.filter(c => c !== code));
    } else {
      setAutomationLanguages([...automationLanguages, code]);
    }
  };

  const handleStartAutomation = async () => {
    setIsAutomationActive(true);
    setSecondsUntilNext(automationIntervalMinutes * 60);

    const initLog = {
      id: String(Date.now()),
      time: new Date().toLocaleTimeString(),
      text: `▶ [AUTOMATION STARTED] Engine activated & running on server at ${automationIntervalMinutes} minute(s) interval in ${automationLanguages.length} language(s).`,
      type: 'info' as const
    };

    const newLogs = [initLog, ...automationLogs];
    setAutomationLogs(newLogs);

    // Save to server database so automation runs even if browser or PC is turned off
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          automationActive: true,
          automationIntervalMinutes,
          automationLanguages,
          automationPublishStatus,
          automationLogs: newLogs
        })
      });
    } catch {
      // Ignore
    }

    // Trigger immediate generation step
    runAutomatedGenerationStep();
  };

  const handleStopAutomation = async () => {
    setIsAutomationActive(false);

    const stopLog = {
      id: String(Date.now()),
      time: new Date().toLocaleTimeString(),
      text: `⏹ [AUTOMATION STOPPED] Engine paused by user.`,
      type: 'info' as const
    };

    const newLogs = [stopLog, ...automationLogs];
    setAutomationLogs(newLogs);

    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          automationActive: false,
          automationLogs: newLogs
        })
      });
    } catch {
      // Ignore
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      
      {/* Header & Mode Switch */}
      <div className="border-b border-gray-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-700" />
            AI Article Generator & Automation Engine
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Manual SEO generation or 100% Full Automated auto-publishing background engine.
          </p>
        </div>

        {/* Mode Selector Toggle: Manuel vs Tout Automatique */}
        <div className="flex items-center bg-gray-200 p-1 rounded-xs border border-gray-300 gap-1 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setGenerationMode('manual')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xs flex items-center gap-1.5 transition-all ${
              generationMode === 'manual'
                ? 'bg-white text-gray-900 shadow-xs border border-gray-300'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Mode Manuel (Manual)</span>
          </button>
          
          <button
            type="button"
            onClick={() => setGenerationMode('auto')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xs flex items-center gap-1.5 transition-all ${
              generationMode === 'auto'
                ? 'bg-purple-700 text-white shadow-xs font-bold ring-2 ring-purple-400'
                : 'text-purple-900 hover:bg-purple-100'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Mode 100% Automatique</span>
          </button>
        </div>
      </div>

      {/* 🤖 AUTOMATION ENGINE SECTION (WHEN AUTOMATION MODE IS SELECTED OR ACTIVE) */}
      {generationMode === 'auto' && (
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white p-5 rounded-xs border border-purple-800 space-y-5 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-900/80 rounded-xs text-amber-400 border border-purple-700">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-base text-amber-300 flex items-center gap-2">
                  <span>Génération & Publication 100% Automatique</span>
                  {isAutomationActive ? (
                    <span className="text-[10px] font-mono bg-emerald-500 text-black px-2 py-0.5 rounded-xs font-extrabold uppercase animate-pulse flex items-center gap-1">
                      <Radio className="w-3 h-3" /> En Exécution (Running)
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-xs font-bold uppercase">
                      En Pause (Idle)
                    </span>
                  )}
                </h2>
                <p className="text-xs text-purple-200/90 font-sans mt-0.5">
                  Configurez le délai d&apos;intervalle, les langues cibles, et laissez l&apos;IA rédiger et publier directement dans la base de données.
                </p>
              </div>
            </div>

            {/* Automation Start / Stop Action Buttons */}
            <div className="flex items-center gap-2">
              {!isAutomationActive ? (
                <button
                  type="button"
                  onClick={handleStartAutomation}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xs flex items-center gap-2 shadow-md transition-all scale-102"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Démarrer L&apos;Automatisme (Start)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopAutomation}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xs flex items-center gap-2 shadow-md transition-all"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Arrêter L&apos;Automatisme (Stop)</span>
                </button>
              )}
            </div>
          </div>

          {/* Automation Controls & Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            
            {/* Setting 1: Interval Delay Selection */}
            <div className="bg-white/5 border border-purple-700/60 p-3.5 rounded-xs space-y-2">
              <label className="font-bold text-amber-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Délai de Génération (Interval)</span>
              </label>
              <select
                value={automationIntervalMinutes}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setAutomationIntervalMinutes(val);
                  if (isAutomationActive) setSecondsUntilNext(val * 60);
                }}
                className="w-full bg-slate-900 text-white border border-purple-500 p-2 font-mono text-xs rounded-xs focus:ring-1 focus:ring-amber-400"
              >
                <option value={1}>⏱️ 1 minute (Test Rapid / Démo)</option>
                <option value={60}>🕐 1 heure (1 Hour)</option>
                <option value={300}>🕔 5 heures (5 Hours)</option>
                <option value={1440}>📅 24 heures (24 Hours / Journalier)</option>
              </select>
              <p className="text-[11px] text-purple-300/80">
                Un nouvel article sera généré et publié automatiquement toutes les {automationIntervalMinutes} min.
              </p>
            </div>

            {/* Setting 2: Multi-Language Selector */}
            <div className="bg-white/5 border border-purple-700/60 p-3.5 rounded-xs space-y-2">
              <label className="font-bold text-amber-300 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-amber-400" />
                <span>Langues Cibles (Multi-Select)</span>
              </label>
              <div className="flex flex-wrap gap-1.5 pt-0.5 max-h-24 overflow-y-auto">
                {SUPPORTED_LANGUAGES.map((l) => {
                  const isChecked = automationLanguages.includes(l.code);
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => handleToggleAutomationLanguage(l.code)}
                      className={`px-2 py-1 text-[11px] font-mono rounded-xs border flex items-center gap-1 transition-all ${
                        isChecked
                          ? 'bg-amber-400 text-gray-950 font-bold border-amber-300'
                          : 'bg-black/40 text-purple-200 border-purple-700/60 hover:bg-white/10'
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.code.toUpperCase()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Setting 3: Publishing Action & Status Counter */}
            <div className="bg-white/5 border border-purple-700/60 p-3.5 rounded-xs space-y-2 flex flex-col justify-between">
              <div>
                <label className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Settings2 className="w-4 h-4 text-amber-400" />
                  <span>Statut de Publication</span>
                </label>
                <select
                  value={automationPublishStatus}
                  onChange={(e) => setAutomationPublishStatus(e.target.value as 'published' | 'draft')}
                  className="w-full bg-slate-900 text-white border border-purple-500 p-2 text-xs rounded-xs mt-1"
                >
                  <option value="published">⚡ Publication Immédiate (Direct to DB)</option>
                  <option value="draft">📝 Enregistrer comme Brouillon (Draft)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-purple-800/80 flex items-center justify-between font-mono text-xs">
                <span className="text-purple-300">Articles générés:</span>
                <span className="font-extrabold text-amber-300 bg-black/50 px-2 py-0.5 rounded-xs border border-amber-400/30">
                  {automationCount} publiés
                </span>
              </div>
            </div>

          </div>

          {/* Live Progress Terminal & Activity Feed */}
          <div className="bg-black/80 border border-purple-900 rounded-xs p-3 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-purple-900 pb-1.5 text-purple-300">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-amber-400" />
                <span className="font-bold">Journal d&apos;Exécution en Direct (Automation Log)</span>
              </div>
              {isAutomationActive && (
                <div className="flex items-center gap-2 text-[11px] text-amber-300">
                  {isAutoGenerating && <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />}
                  <span>Prochaine génération: {secondsUntilNext}s</span>
                </div>
              )}
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1 text-[11px] pr-1">
              {automationLogs.length === 0 ? (
                <p className="text-gray-500 italic py-2 text-center">
                  L&apos;automatisme est prêt. Cliquez sur &ldquo;Démarrer L&apos;Automatisme&rdquo; pour lancer la génération et publication automatique.
                </p>
              ) : (
                automationLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 leading-tight">
                    <span className="text-purple-400 opacity-70 shrink-0">[{log.time}]</span>
                    <span className={
                      log.type === 'success'
                        ? 'text-emerald-400 font-semibold'
                        : log.type === 'error'
                        ? 'text-red-400 font-semibold'
                        : 'text-purple-200'
                    }>
                      {log.text}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Target Language Chooser Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 rounded-xs shadow-xs space-y-3 border border-blue-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="font-bold text-sm tracking-tight">Select Target Article Language / Choix de la Langue de Publication:</span>
          </div>
          <span className="font-mono text-xs text-amber-300 bg-black/40 px-3 py-1 rounded-xs border border-amber-400/40 font-bold self-start sm:self-auto">
            Target: {getLanguageByCode(language).flag} {getLanguageByCode(language).name} ({getLanguageByCode(language).code.toUpperCase()})
          </span>
        </div>
        <p className="text-xs text-blue-200/90 leading-relaxed font-sans">
          All generated titles, causes, step-by-step fix guides, technical explanations, and FAQs will be produced 100% natively in this chosen language.
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 pt-1">
          {SUPPORTED_LANGUAGES.map((l) => {
            const isSelected =
              language === l.code ||
              language.toLowerCase() === l.englishName.toLowerCase() ||
              language.toLowerCase() === l.name.toLowerCase();
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  setLanguage(l.code);
                  if (errorCode) {
                    handleFetchAiSuggestions(errorCode, true, l.code);
                  }
                }}
                className={`p-2.5 rounded-xs border text-xs flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-amber-400 text-gray-950 font-bold border-amber-300 shadow-md scale-105 ring-2 ring-amber-300/50'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40'
                }`}
              >
                <span className="text-xl leading-none">{l.flag}</span>
                <span className="mt-1 text-[11px] font-semibold">{l.name}</span>
                <span className="text-[9px] font-mono opacity-80 uppercase tracking-wide">{l.code}</span>
              </button>
            );
          })}
        </div>
      </div>

      {successNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xs flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{successNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessNotice('')}
            className="text-[11px] font-bold text-emerald-800 hover:underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Duplicate Article Warning Notice */}
      {existingMatch && (
        <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">⚠️ Article Already Exists in Database: </span>
              <span className="font-serif font-bold">&ldquo;{existingMatch.title}&rdquo;</span>
              <span className="ml-2 font-mono text-[10px] text-amber-800">[{existingMatch.status.toUpperCase()}]</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push(`/admin/articles`)}
            className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white font-bold text-[11px] rounded-xs flex items-center gap-1 shrink-0 transition-colors"
          >
            <span>View / Edit Existing Article</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick AI Pick Dynamic Presets Panel */}
      <div className="bg-blue-50/60 border border-blue-200 p-3.5 rounded-xs text-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200 pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Zap className="w-4 h-4 text-blue-700 shrink-0" />
            <span className="font-bold text-blue-900">Quick AI Pick Popular Error Codes:</span>
            <span className="text-[10px] text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded-xs font-mono font-bold">
              {uncreatedPresets.length} available
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Filter Pills for Presets */}
            <div className="flex items-center gap-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'windows', label: 'Windows' },
                { id: 'automotive', label: 'Automotive' },
                { id: 'printers', label: 'Printers' },
                { id: 'gaming', label: 'Gaming' },
                { id: 'appliances', label: 'Appliances' },
                { id: 'software', label: 'Software' }
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setPresetCategoryFilter(c.id);
                    setPresetIndex(0);
                  }}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded-xs border transition-colors ${
                    presetCategoryFilter === c.id
                      ? 'bg-blue-700 text-white border-blue-700 font-bold'
                      : 'bg-white text-blue-900 border-blue-300 hover:bg-blue-100'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {uncreatedPresets.length > 8 && (
              <button
                type="button"
                onClick={handleShufflePresets}
                className="text-[11px] font-mono font-semibold text-blue-800 hover:text-blue-950 hover:underline flex items-center gap-1 bg-white border border-blue-300 px-2 py-0.5 rounded-xs shadow-2xs transition-colors shrink-0"
              >
                <RefreshCw className="w-3 h-3 text-blue-600 shrink-0" />
                <span>Cycle Picks</span>
              </button>
            )}
          </div>
        </div>

        {uncreatedPresets.length === 0 ? (
          <p className="text-gray-600 italic text-[11px] font-mono py-1">
            🎉 All preset error codes for this filter have been created! Type any custom error code below to generate.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {visiblePresets.map((p) => (
              <button
                key={p.code}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="px-2.5 py-1 font-mono text-[11px] rounded-xs transition-all flex items-center gap-1 border shadow-2xs bg-white hover:bg-blue-100 hover:border-blue-400 border-blue-300 text-blue-950 font-medium"
                title={`Generate article for ${p.label}`}
              >
                <span>+ {p.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Manual Form Section */}
      <form onSubmit={handleGenerate} className="bg-gray-50 border border-gray-300 p-5 rounded-xs text-xs space-y-5">
        
        {/* Top bar with auto-fill button */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
          <span className="font-bold text-gray-800 font-serif text-sm">Article Generation Parameters</span>
          <button
            type="button"
            onClick={() => handleFetchAiSuggestions(errorCode, true)}
            disabled={suggesting || !errorCode}
            className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs rounded-xs flex items-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50"
          >
            {suggesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 text-amber-300" />}
            <span>{suggesting ? 'Analyzing...' : '✨ AI Auto-Fill Form'}</span>
          </button>
        </div>

        {/* Row 1: Error Code, Brand, Device, Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Field 1: Error Code */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block font-bold text-gray-800">Error Code *</label>
              <button
                type="button"
                onClick={() => handleFetchAiSuggestions(errorCode, true)}
                className="text-[10px] text-purple-700 hover:underline font-semibold flex items-center gap-0.5"
              >
                <Sparkles className="w-3 h-3 text-purple-600" />
                AI Suggest
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. 0x80070005, E-01, P0420, 404"
              value={errorCode}
              onChange={(e) => handleErrorCodeInputChange(e.target.value)}
              className="w-full bg-white border border-gray-300 p-2 font-mono rounded-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
              required
            />
          </div>

          {/* Field 2: Brand / System (Dynamic based on Error Code) */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block font-bold text-gray-800">Brand / System</label>
              {aiSuggestions?.brand && (
                <span className="text-[10px] text-purple-700 bg-purple-50 px-1 border border-purple-200 rounded-xs font-mono">
                  AI: {aiSuggestions.brand}
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="e.g. Canon, Toyota, Microsoft, PlayStation"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full bg-white border border-gray-300 p-2 font-mono rounded-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            {/* Dynamic AI Suggested Brand Pills (updates based on error code) */}
            <div className="flex flex-wrap gap-1 pt-1">
              {dynamicBrandPills.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBrand(b)}
                  className={`px-1.5 py-0.5 text-[10px] rounded-xs border transition-colors ${
                    brand.toLowerCase() === b.toLowerCase()
                      ? 'bg-blue-700 text-white border-blue-700 font-bold'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  + {b}
                </button>
              ))}
            </div>
          </div>

          {/* Field 3: Device / Hardware (Dynamic based on Error Code) */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block font-bold text-gray-800">Device / Hardware</label>
              {aiSuggestions?.device && (
                <span className="text-[10px] text-purple-700 bg-purple-50 px-1 border border-purple-200 rounded-xs font-mono">
                  AI: {aiSuggestions.device}
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="e.g. EcoTank Printer, Windows 11, RAV4"
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              className="w-full bg-white border border-gray-300 p-2 font-mono rounded-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            {/* Dynamic AI Suggested Device Pills (updates based on error code) */}
            <div className="flex flex-wrap gap-1 pt-1">
              {dynamicDevicePills.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDevice(d)}
                  className={`px-1.5 py-0.5 text-[10px] rounded-xs border transition-colors ${
                    device.toLowerCase() === d.toLowerCase()
                      ? 'bg-blue-700 text-white border-blue-700 font-bold'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  + {d}
                </button>
              ))}
            </div>
          </div>

          {/* Field 4: Category (Dynamic based on Error Code) */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block font-bold text-gray-800">Category</label>
              {aiSuggestions?.category && (
                <span className="text-[10px] text-purple-700 bg-purple-50 px-1 border border-purple-200 rounded-xs font-mono">
                  AI Pick: {aiSuggestions.category}
                </span>
              )}
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white border border-gray-300 p-2 rounded-xs focus:outline-none focus:ring-1 focus:ring-blue-600 capitalize font-mono"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
              {!categories.some(c => c.slug === category) && category && (
                <option value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1).replace(/[-_]/g, ' ')} (AI Added)
                </option>
              )}
            </select>
            {/* Dynamic Category Badges */}
            <div className="flex flex-wrap gap-1 pt-1">
              {dynamicCategoryPills.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.slug)}
                  className={`px-1.5 py-0.5 text-[10px] rounded-xs border ${
                    category === c.slug
                      ? 'bg-blue-700 text-white border-blue-700 font-bold'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Row 2: Language, Keywords, Article Length, Model, Temperature */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2 border-t border-gray-200">
          
          {/* Language */}
          <div className="space-y-1">
            <label className="block font-semibold text-gray-700">Language</label>
            <input
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-white border border-gray-300 p-2 rounded-xs"
            />
            <div className="flex flex-wrap gap-1 pt-1">
              {['English', 'French', 'Spanish', 'German', 'Japanese'].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`px-1 py-0.5 text-[9px] rounded-xs border ${
                    language === lang ? 'bg-blue-700 text-white font-bold' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div className="space-y-1 lg:col-span-2">
            <div className="flex justify-between items-center">
              <label className="block font-semibold text-gray-700">SEO Keywords</label>
              <button
                type="button"
                onClick={() => handleFetchAiSuggestions(errorCode, false)}
                className="text-[10px] text-purple-700 hover:underline font-semibold flex items-center gap-0.5"
              >
                <Sparkles className="w-3 h-3 text-purple-600" />
                AI Generate Keywords
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. fix, access denied, update error"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full bg-white border border-gray-300 p-2 rounded-xs font-mono"
            />
            {/* Clickable AI Keyword Tags */}
            <div className="flex flex-wrap gap-1 pt-1">
              {(aiSuggestions?.keywords || ['troubleshooting', 'access denied', 'error fix', 'diagnostic manual', 'registry fix']).map((kw) => {
                const isSelected = keywords.includes(kw);
                return (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => handleToggleKeywordTag(kw)}
                    className={`px-1.5 py-0.5 text-[10px] font-mono rounded-xs border transition-colors ${
                      isSelected ? 'bg-purple-700 text-white border-purple-700 font-bold' : 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}{kw}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Article Length */}
          <div className="space-y-1">
            <label className="block font-semibold text-gray-700">Article Length</label>
            <select
              value={articleLength}
              onChange={(e) => setArticleLength(e.target.value)}
              className="w-full bg-white border border-gray-300 p-2 rounded-xs"
            >
              <option value="Short (500 words)">Short (~500 words)</option>
              <option value="Medium (800 words)">Medium (~800 words)</option>
              <option value="Comprehensive (1200+ words)">Comprehensive (~1200+ words)</option>
            </select>
          </div>

          {/* AI Model & Temperature */}
          <div className="space-y-1">
            <label className="block font-semibold text-gray-700">AI Model & Temp ({temperature})</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-white border border-gray-300 p-2 font-mono text-[11px] rounded-xs font-medium"
            >
              <option value="auto_cascade">⚡ [RECOMMANDÉ] Cascade Auto: Top 3 Gratuits (Nemotron 3 Ultra ➔ Laguna S 2.1 ➔ Nemotron 3.5 Lightning ➔ Gemini)</option>
              <option value="nvidia/nemotron-3-ultra:free">★ #1 NVIDIA: Nemotron 3 Ultra (free) - 550B MoE (1M context)</option>
              <option value="poolside/laguna-s-2.1:free">★ #2 Poolside: Laguna S 2.1 (free) - 118B Code & Diag (262K)</option>
              <option value="nvidia/nemotron-3.5-lightning:free">★ #3 NVIDIA: Nemotron 3.5 Lightning (free) - 30B MoE (1M context)</option>
              <option value="gemini-3.6-flash">Google Gemini 3.6 Flash (Secours Serveur)</option>
            </select>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full mt-1"
            />
          </div>

        </div>

        {/* AI Suggested Article Outline Card */}
        {aiSuggestions?.suggestedTitle && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xs space-y-1.5 text-xs text-purple-950">
            <div className="font-bold flex items-center gap-1 text-purple-900">
              <Lightbulb className="w-4 h-4 text-purple-600" />
              <span>AI Article Plan Suggestion:</span>
            </div>
            <div className="font-serif font-bold text-sm text-purple-900">
              &ldquo;{aiSuggestions.suggestedTitle}&rdquo;
            </div>
            {aiSuggestions.suggestedOutline && (
              <div className="flex flex-wrap gap-2 text-[11px] font-mono text-purple-800">
                {aiSuggestions.suggestedOutline.map((item, idx) => (
                  <span key={idx} className="bg-white/80 px-2 py-0.5 border border-purple-200 rounded-xs">
                    {idx + 1}. {item}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="pt-2 flex justify-between items-center">
          <div className="text-[11px] text-gray-500 font-mono">
            {brand} • {device} • {category} • {language}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs rounded-xs flex items-center gap-2 shadow-2xs transition-colors disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Generating Full SEO Article...' : 'Generate with AI'}
          </button>
        </div>

      </form>

      {/* Output / Live Preview Section */}
      {generatedArticle && (
        <div className="space-y-6 pt-4 border-t border-gray-300">
          
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-900 text-white rounded-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base">{generatedArticle.title}</span>
                <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-mono font-bold rounded-xs">
                  SEO Score: {generatedArticle.seoScore || 88}/100
                </span>
              </div>
              <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                Slug: /error/{generatedArticle.slug}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold rounded-xs flex items-center gap-1.5 border border-gray-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy JSON'}
              </button>
              <button
                onClick={() => handleSave('draft')}
                className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-600 text-white text-xs font-semibold rounded-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Save Draft
              </button>
              <button
                onClick={() => handleSave('published')}
                className="px-3.5 py-1.5 bg-green-700 hover:bg-green-600 text-white text-xs font-semibold rounded-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Publish Immediately
              </button>
            </div>
          </div>

          {/* AI Optimizations & Smart Improvements Assistant */}
          <div className="p-3 bg-purple-900 text-purple-100 rounded-xs space-y-2 text-xs">
            <div className="font-bold flex items-center gap-2 text-purple-200 border-b border-purple-800 pb-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>AI Live Article Enhancer & Optimizations:</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (generatedArticle) {
                    setGeneratedArticle({
                      ...generatedArticle,
                      seoScore: 98,
                      faq: [
                        ...(generatedArticle.faq || []),
                        { question: `Can ${generatedArticle.errorCode} cause permanent data loss?`, answer: 'In most cases no, but restoring registry defaults or reinstalling drivers prevents system instability.' },
                        { question: `Is ${generatedArticle.errorCode} covered under warranty?`, answer: 'If hardware fault is confirmed via diagnostic code, manufacturer repair or replacement is covered under standard warranty.' }
                      ]
                    });
                  }
                }}
                className="px-3 py-1 bg-purple-800 hover:bg-purple-700 text-white font-semibold rounded-xs text-[11px] flex items-center gap-1 border border-purple-700"
              >
                + AI Add 2 FAQ Items (Boost SEO to 98/100)
              </button>

              <button
                type="button"
                onClick={() => {
                  if (generatedArticle) {
                    setGeneratedArticle({
                      ...generatedArticle,
                      solutions: [
                        ...(generatedArticle.solutions || []),
                        {
                          title: 'Solution 3: Clear System Cache & Flush DNS',
                          description: 'Remove stale temporary configuration files and re-register system services.',
                          steps: ['Open Command Prompt as Administrator', 'Type "ipconfig /flushdns" and press Enter', 'Restart service and re-verify error status']
                        }
                      ]
                    });
                  }
                }}
                className="px-3 py-1 bg-purple-800 hover:bg-purple-700 text-white font-semibold rounded-xs text-[11px] flex items-center gap-1 border border-purple-700"
              >
                + AI Add Extra Troubleshooting Solution
              </button>
            </div>
          </div>

          {/* Details & Live Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
            
            {/* Meta & Schema Inspector */}
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 border border-gray-300 rounded-xs space-y-2">
                <div className="font-serif font-bold text-sm text-gray-900 border-b border-gray-200 pb-1">
                  SEO Meta Audit
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Meta Title</label>
                  <p className="font-mono text-gray-900 bg-white p-2 border border-gray-200 mt-0.5 rounded-xs">
                    {generatedArticle.metaTitle}
                  </p>
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Meta Description</label>
                  <p className="font-mono text-gray-900 bg-white p-2 border border-gray-200 mt-0.5 rounded-xs">
                    {generatedArticle.metaDescription}
                  </p>
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Keywords</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {generatedArticle.keywords?.map((k, idx) => (
                      <span key={idx} className="bg-gray-200 text-gray-800 px-1.5 py-0.5 font-mono text-[10px]">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-900 text-gray-300 rounded-xs space-y-2">
                <div className="font-serif font-bold text-xs text-white border-b border-gray-800 pb-1">
                  Schema.org JSON-LD Output
                </div>
                <pre className="font-mono text-[10px] overflow-x-auto max-h-60 text-green-400 leading-tight">
                  {generatedArticle.schemaJsonLd}
                </pre>
              </div>
            </div>

            {/* Content Preview */}
            <div className="lg:col-span-2 p-6 border border-gray-300 bg-white rounded-xs space-y-4 font-sans text-gray-800 leading-relaxed">
              <div className="border-b border-gray-300 pb-2 flex justify-between items-center">
                <h3 className="font-serif font-bold text-base text-gray-900">
                  Article Preview ({generatedArticle.errorCode})
                </h3>
                <span className="font-mono text-xs text-gray-500">Live Render Mode</span>
              </div>

              <div>
                <h2 className="font-serif font-bold text-xl text-gray-900">{generatedArticle.title}</h2>
                <p className="mt-2 text-sm bg-[#f8f9fa] border-l-4 border-blue-700 p-3 font-serif">
                  {generatedArticle.shortDefinition}
                </p>
              </div>

              <div>
                <h4 className="font-serif font-bold text-sm text-gray-900 border-b border-gray-200 pb-1">Meaning</h4>
                <p className="mt-1 text-xs">{generatedArticle.meaning}</p>
              </div>

              <div>
                <h4 className="font-serif font-bold text-sm text-gray-900 border-b border-gray-200 pb-1">Causes</h4>
                <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                  {generatedArticle.causes?.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-serif font-bold text-sm text-gray-900 border-b border-gray-200 pb-1">Solutions</h4>
                <div className="space-y-2 mt-2">
                  {generatedArticle.solutions?.map((sol, i) => (
                    <div key={i} className="p-3 border border-gray-200 bg-gray-50 rounded-xs">
                      <div className="font-bold text-xs text-gray-900">{sol.title}</div>
                      <p className="text-xs text-gray-700 mt-1">{sol.description}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
