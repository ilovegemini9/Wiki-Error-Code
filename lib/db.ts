import fs from 'fs';
import path from 'path';
import { Article, Category, Brand, Settings, AiGenerationLog, AdminUser } from './types';
import { INITIAL_ARTICLES, INITIAL_CATEGORIES, INITIAL_BRANDS, INITIAL_SETTINGS } from './initial-data';
import { initAutomationBackgroundServer } from './automation-runner';

interface DatabaseSchema {
  articles: Article[];
  categories: Category[];
  brands: Brand[];
  settings: Settings;
  aiLogs: AiGenerationLog[];
  adminUsers: AdminUser[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'error_code_wiki.db.json');
const BACKUP_FILE = path.join(DATA_DIR, 'error_code_wiki_backup.json');

// Default development admin password hash for password '111111'
const DEFAULT_DEV_ADMIN_USER: AdminUser = {
  id: 'usr-admin-1',
  username: 'admin',
  passwordHash: '$2a$10$e74.q2JvO2R9oBvPj4l21e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e', // Simple token verification check
  updatedAt: new Date().toISOString()
};

function ensureDirectoryExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

let memoryDb: DatabaseSchema | null = null;

function loadDb(): DatabaseSchema {
  if (memoryDb) return memoryDb;

  ensureDirectoryExists(DATA_DIR);

  // Initialize background automation runner loop
  initAutomationBackgroundServer();

  let fileArticles: Article[] = [];
  let fileCategories: Category[] = [];
  let fileBrands: Brand[] = [];
  let fileSettings: Partial<Settings> = {};
  let fileLogs: AiGenerationLog[] = [];
  let fileAdmins: AdminUser[] = [];

  // Read primary file if exists
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed.articles && Array.isArray(parsed.articles)) fileArticles = parsed.articles;
      if (parsed.categories && Array.isArray(parsed.categories)) fileCategories = parsed.categories;
      if (parsed.brands && Array.isArray(parsed.brands)) fileBrands = parsed.brands;
      if (parsed.settings) fileSettings = parsed.settings;
      if (parsed.aiLogs) fileLogs = parsed.aiLogs;
      if (parsed.adminUsers) fileAdmins = parsed.adminUsers;
    } catch (e) {
      console.error('Failed to read primary database file:', e);
    }
  }

  // Read secondary backup file if exists to merge any missing records
  if (fs.existsSync(BACKUP_FILE)) {
    try {
      const bContent = fs.readFileSync(BACKUP_FILE, 'utf-8');
      const bParsed = JSON.parse(bContent);
      if (bParsed.articles && Array.isArray(bParsed.articles)) {
        bParsed.articles.forEach((ba: Article) => {
          if (!fileArticles.some(a => a.id === ba.id || (a.errorCode.toLowerCase() === ba.errorCode.toLowerCase() && a.language === ba.language))) {
            fileArticles.push(ba);
          }
        });
      }
      if (bParsed.settings && !fileSettings.openRouterApiKey && bParsed.settings.openRouterApiKey) {
        fileSettings.openRouterApiKey = bParsed.settings.openRouterApiKey;
      }
    } catch (e) {
      console.error('Failed to read backup database file:', e);
    }
  }

  // Merge initial articles with file articles (preferring file articles)
  const articleMap = new Map<string, Article>();
  INITIAL_ARTICLES.forEach(a => articleMap.set(a.id, a));
  fileArticles.forEach((a: Article) => {
    // Unique key by id and by code+language
    articleMap.set(a.id, a);
  });

  // Merge initial categories with file categories
  const categoryMap = new Map<string, Category>();
  INITIAL_CATEGORIES.forEach(c => categoryMap.set(c.id, c));
  fileCategories.forEach((c: Category) => categoryMap.set(c.id, c));

  // Merge initial brands with file brands
  const brandMap = new Map<string, Brand>();
  INITIAL_BRANDS.forEach(b => brandMap.set(b.id, b));
  fileBrands.forEach((b: Brand) => brandMap.set(b.id, b));

  const mergedSettings = { ...INITIAL_SETTINGS, ...fileSettings };
  if (!mergedSettings.openRouterApiKey && process.env.OPENROUTER_API_KEY) {
    mergedSettings.openRouterApiKey = process.env.OPENROUTER_API_KEY;
  }

  memoryDb = {
    articles: Array.from(articleMap.values()),
    categories: Array.from(categoryMap.values()),
    brands: Array.from(brandMap.values()),
    settings: mergedSettings,
    aiLogs: fileLogs,
    adminUsers: fileAdmins.length > 0 ? fileAdmins : [DEFAULT_DEV_ADMIN_USER]
  };

  saveDb(memoryDb);
  return memoryDb;
}

function saveDb(db: DatabaseSchema) {
  memoryDb = db;
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
  if (isBuildPhase) return;

  ensureDirectoryExists(DATA_DIR);
  try {
    const dataStr = JSON.stringify(db, null, 2);
    fs.writeFileSync(DB_FILE, dataStr, 'utf-8');
    fs.writeFileSync(BACKUP_FILE, dataStr, 'utf-8');
  } catch (e) {
    console.error('Failed to write database files:', e);
  }
}

export const db = {
  // --- ARTICLES ---
  getArticles(params?: {
    status?: 'draft' | 'published' | 'all';
    categorySlug?: string;
    brandSlug?: string;
    language?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): { articles: Article[]; total: number } {
    const data = loadDb();
    let list = [...data.articles];

    const status = params?.status || 'published';
    if (status !== 'all') {
      list = list.filter(a => a.status === status);
    }

    if (params?.language && params.language !== 'all') {
      const cleanLang = params.language.toLowerCase().trim().split('-')[0];
      list = list.filter(a => {
        const artLang = (a.language || 'en').toLowerCase().trim().split('-')[0];
        return artLang === cleanLang;
      });
    }

    if (params?.categorySlug) {
      const category = data.categories.find(c => c.slug === params.categorySlug);
      if (category) {
        list = list.filter(a => a.categoryId === category.id);
      }
    }

    if (params?.brandSlug) {
      const brand = data.brands.find(b => b.slug === params.brandSlug);
      if (brand) {
        list = list.filter(a => a.brandId === brand.id);
      }
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(a => 
        a.errorCode.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        a.shortDefinition.toLowerCase().includes(q) ||
        a.meaning.toLowerCase().includes(q) ||
        a.keywords.some(k => k.toLowerCase().includes(q)) ||
        a.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort by newest first
    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const total = list.length;
    const offset = params?.offset || 0;
    const limit = params?.limit || list.length;
    const paginated = list.slice(offset, offset + limit);

    return { articles: paginated, total };
  },

  getArticleBySlug(slug: string): Article | null {
    const data = loadDb();
    const cleanSlug = slug.toLowerCase().trim();
    return data.articles.find(a => a.slug.toLowerCase() === cleanSlug) || null;
  },

  getArticleById(id: string): Article | null {
    const data = loadDb();
    return data.articles.find(a => a.id === id) || null;
  },

  saveArticle(article: Partial<Article> & { errorCode: string; title: string }): Article {
    const data = loadDb();
    const now = new Date().toISOString();
    const targetLang = (article.language || 'en').toLowerCase().trim();
    const targetCode = article.errorCode.trim();

    // 1. Auto-register Category if it's new
    let catId = (article.categoryId || 'windows').trim();
    let categoryObj = data.categories.find(c => c.id === catId || c.slug === catId || c.name.toLowerCase() === catId.toLowerCase());
    if (!categoryObj && catId) {
      const cleanCatSlug = catId.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      const catName = catId.charAt(0).toUpperCase() + catId.slice(1);
      categoryObj = {
        id: cleanCatSlug,
        name: catName,
        slug: cleanCatSlug,
        icon: 'BookOpen',
        description: `Diagnostic error code guides and manuals for ${catName}`
      };
      data.categories.push(categoryObj);
      catId = cleanCatSlug;
    } else if (categoryObj) {
      catId = categoryObj.id;
    }

    // 2. Auto-register Brand if it's new
    let bId = (article.brandId || 'microsoft').trim();
    let brandObj = data.brands.find(b => b.id === bId || b.slug === bId || b.name.toLowerCase() === bId.toLowerCase());
    const deviceType = article.deviceType || 'General Device';
    if (!brandObj && bId) {
      const cleanBrandSlug = bId.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      const brandName = bId.charAt(0).toUpperCase() + bId.slice(1);
      brandObj = {
        id: cleanBrandSlug,
        name: brandName,
        slug: cleanBrandSlug,
        categoryId: catId,
        deviceTypes: [deviceType],
        description: `Diagnostic manuals and troubleshooting codes for ${brandName}`
      };
      data.brands.push(brandObj);
      bId = cleanBrandSlug;
    } else if (brandObj) {
      bId = brandObj.id;
      // Auto-add new hardware / device type to brand's deviceTypes array
      if (deviceType && !brandObj.deviceTypes.includes(deviceType)) {
        brandObj.deviceTypes.push(deviceType);
      }
    }

    // 3. Clean up draft / duplicate entries when publishing
    const status = article.status || 'published';
    if (status === 'published') {
      data.articles = data.articles.filter(a => {
        if (article.id && a.id === article.id) return true;
        const sameCode = a.errorCode.toLowerCase().trim() === targetCode.toLowerCase();
        const sameLang = (a.language || 'en').toLowerCase().trim() === targetLang;
        // Erase old draft entries for the same code + language
        if (sameCode && sameLang && a.status === 'draft') {
          return false;
        }
        return true;
      });
    }

    let existingIndex = -1;
    if (article.id) {
      existingIndex = data.articles.findIndex(a => a.id === article.id);
    }
    if (existingIndex < 0) {
      existingIndex = data.articles.findIndex(a => 
        a.errorCode.toLowerCase().trim() === targetCode.toLowerCase() &&
        (a.language || 'en').toLowerCase().trim() === targetLang
      );
    }

    // Generate clean slug if missing or append language suffix for non-English articles
    let slug = article.slug;
    if (!slug) {
      const prefix = brandObj ? brandObj.slug : 'error';
      const cleanCode = targetCode.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      slug = targetLang === 'en' ? `${prefix}-${cleanCode}` : `${prefix}-${cleanCode}-${targetLang}`;
    } else if (targetLang !== 'en' && !slug.toLowerCase().endsWith(`-${targetLang}`)) {
      slug = `${slug}-${targetLang}`;
    }

    const newArticle: Article = {
      id: article.id || `art-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      errorCode: targetCode,
      title: article.title,
      slug: slug,
      metaTitle: article.metaTitle || `${article.title} - Fix Guide`,
      metaDescription: article.metaDescription || article.shortDefinition || `Learn how to fix ${targetCode} error code.`,
      shortDefinition: article.shortDefinition || '',
      meaning: article.meaning || '',
      causes: article.causes || [],
      solutions: article.solutions || [],
      technicalExplanation: article.technicalExplanation || '',
      faq: article.faq || [],
      schemaJsonLd: article.schemaJsonLd || '',
      canonicalUrl: article.canonicalUrl || `${data.settings.siteUrl}/error/${slug}`,
      categoryId: catId,
      brandId: bId,
      deviceType: deviceType,
      language: targetLang,
      keywords: article.keywords && article.keywords.length > 0 ? article.keywords : [targetCode],
      tags: article.tags && article.tags.length > 0 ? article.tags : [targetCode],
      featuredImage: article.featuredImage || '',
      status: status,
      readingTime: article.readingTime || '3 min read',
      internalLinks: article.internalLinks || [],
      createdAt: article.createdAt || now,
      updatedAt: now,
      scheduledFor: article.scheduledFor || undefined,
      viewsCount: article.viewsCount || 0,
      seoScore: article.seoScore || 85
    };

    if (existingIndex >= 0) {
      data.articles[existingIndex] = { ...data.articles[existingIndex], ...newArticle, updatedAt: now };
    } else {
      data.articles.unshift(newArticle);
    }

    saveDb(data);
    return existingIndex >= 0 ? data.articles[existingIndex] : newArticle;
  },

  deleteArticle(id: string): boolean {
    const data = loadDb();
    const initialLen = data.articles.length;
    data.articles = data.articles.filter(a => a.id !== id);
    if (data.articles.length !== initialLen) {
      saveDb(data);
      return true;
    }
    return false;
  },

  incrementArticleViews(id: string) {
    const data = loadDb();
    const article = data.articles.find(a => a.id === id);
    if (article) {
      article.viewsCount = (article.viewsCount || 0) + 1;
      saveDb(data);
    }
  },

  // --- CATEGORIES ---
  getCategories(language?: string): Category[] {
    const data = loadDb();
    let categories = [...data.categories];

    if (language && language !== 'all') {
      const cleanLang = language.toLowerCase().trim().split('-')[0];
      // Include categories assigned to this language or categories with no language specified (universal)
      categories = categories.filter(c => !c.language || c.language.toLowerCase().trim().split('-')[0] === cleanLang);
    }

    return categories.map(c => {
      const catArticles = data.articles.filter(a => {
        if (a.categoryId !== c.id || a.status !== 'published') return false;
        if (language && language !== 'all') {
          const artLang = (a.language || 'en').toLowerCase().trim().split('-')[0];
          return artLang === language.toLowerCase().trim().split('-')[0];
        }
        return true;
      });

      return {
        ...c,
        count: catArticles.length
      };
    });
  },

  getCategoryBySlug(slug: string, language?: string): Category | null {
    const categories = this.getCategories(language);
    return categories.find(c => c.slug === slug) || null;
  },

  saveCategory(category: Partial<Category> & { name: string; slug: string }): Category {
    const data = loadDb();
    const existingIndex = data.categories.findIndex(c => c.id === category.id || c.slug === category.slug);

    const newCat: Category = {
      id: category.id || `cat-${Date.now()}`,
      name: category.name,
      slug: category.slug.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
      icon: category.icon || 'Folder',
      description: category.description || '',
      language: category.language ? category.language.toLowerCase().trim() : undefined
    };

    if (existingIndex >= 0) {
      data.categories[existingIndex] = { ...data.categories[existingIndex], ...newCat };
    } else {
      data.categories.push(newCat);
    }

    saveDb(data);
    return newCat;
  },

  deleteCategory(id: string): boolean {
    const data = loadDb();
    data.categories = data.categories.filter(c => c.id !== id);
    saveDb(data);
    return true;
  },

  // --- BRANDS ---
  getBrands(): Brand[] {
    const data = loadDb();
    return data.brands;
  },

  getBrandBySlug(slug: string): Brand | null {
    const data = loadDb();
    return data.brands.find(b => b.slug === slug) || null;
  },

  saveBrand(brand: Partial<Brand> & { name: string; slug: string }): Brand {
    const data = loadDb();
    const existingIndex = data.brands.findIndex(b => b.id === brand.id || b.slug === brand.slug);

    const newBrand: Brand = {
      id: brand.id || `brand-${Date.now()}`,
      name: brand.name,
      slug: brand.slug.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
      logoUrl: brand.logoUrl || '',
      categoryId: brand.categoryId || 'windows',
      deviceTypes: brand.deviceTypes || ['General Device'],
      description: brand.description || ''
    };

    if (existingIndex >= 0) {
      data.brands[existingIndex] = { ...data.brands[existingIndex], ...newBrand };
    } else {
      data.brands.push(newBrand);
    }

    saveDb(data);
    return newBrand;
  },

  deleteBrand(id: string): boolean {
    const data = loadDb();
    data.brands = data.brands.filter(b => b.id !== id);
    saveDb(data);
    return true;
  },

  // --- SETTINGS ---
  getSettings(): Settings {
    const data = loadDb();
    if (!data.settings.siteUrl || data.settings.siteUrl.includes('errorcodewiki.org')) {
      data.settings.siteUrl = 'https://errorcodewiki.ai.studio';
      saveDb(data);
    }
    return data.settings;
  },

  saveSettings(newSettings: Partial<Settings>): Settings {
    const data = loadDb();
    data.settings = { ...data.settings, ...newSettings };
    saveDb(data);
    return data.settings;
  },

  // --- AI LOGS ---
  logAiGeneration(log: Omit<AiGenerationLog, 'id' | 'createdAt'>): AiGenerationLog {
    const data = loadDb();
    const entry: AiGenerationLog = {
      id: `ailog-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...log
    };
    data.aiLogs.unshift(entry);
    if (data.aiLogs.length > 50) data.aiLogs.pop();
    saveDb(data);
    return entry;
  },

  getAiLogs(): AiGenerationLog[] {
    const data = loadDb();
    return data.aiLogs;
  },

  // --- STATS ---
  getDashboardStats() {
    const data = loadDb();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const todayAiGens = data.aiLogs.filter(l => l.createdAt.startsWith(todayStr)).length;

    return {
      totalArticles: data.articles.length,
      publishedArticles: data.articles.filter(a => a.status === 'published').length,
      draftArticles: data.articles.filter(a => a.status === 'draft').length,
      categoriesCount: data.categories.length,
      brandsCount: data.brands.length,
      todayAiGenerations: todayAiGens,
      recentArticles: data.articles.slice(0, 5),
      recentAiLogs: data.aiLogs.slice(0, 5)
    };
  },

  // --- BULK IMPORT ---
  bulkImportArticles(items: Partial<Article>[]): { imported: number; errors: string[] } {
    const errors: string[] = [];
    let count = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.errorCode || !item.title) {
        errors.push(`Row ${i + 1}: Missing errorCode or title`);
        continue;
      }
      try {
        this.saveArticle({
          errorCode: item.errorCode,
          title: item.title,
          shortDefinition: item.shortDefinition || `Error code ${item.errorCode}`,
          meaning: item.meaning || '',
          causes: Array.isArray(item.causes) ? item.causes : (item.causes ? [String(item.causes)] : []),
          solutions: Array.isArray(item.solutions) ? item.solutions : [],
          technicalExplanation: item.technicalExplanation || '',
          faq: Array.isArray(item.faq) ? item.faq : [],
          categoryId: item.categoryId || 'windows',
          brandId: item.brandId || 'microsoft',
          status: item.status === 'draft' ? 'draft' : 'published',
          keywords: Array.isArray(item.keywords) ? item.keywords : [item.errorCode],
          tags: Array.isArray(item.tags) ? item.tags : [item.errorCode]
        });
        count++;
      } catch (e) {
        errors.push(`Row ${i + 1}: ${e instanceof Error ? e.message : 'Import failed'}`);
      }
    }

    return { imported: count, errors };
  }
};
