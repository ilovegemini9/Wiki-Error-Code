export interface FAQItem {
  question: string;
  answer: string;
}

export interface InternalLinkSuggestion {
  title: string;
  url: string;
  anchorText: string;
}

export interface Article {
  id: string;
  errorCode: string;
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  shortDefinition: string;
  meaning: string;
  causes: string[];
  solutions: {
    title: string;
    description: string;
    steps?: string[];
    codeSnippet?: string;
  }[];
  technicalExplanation: string;
  faq: FAQItem[];
  schemaJsonLd?: string;
  canonicalUrl?: string;
  categoryId: string;
  brandId: string;
  deviceType: string;
  language: string;
  keywords: string[];
  tags: string[];
  featuredImage?: string;
  status: 'draft' | 'published';
  readingTime: string;
  internalLinks: InternalLinkSuggestion[];
  createdAt: string;
  updatedAt: string;
  scheduledFor?: string;
  viewsCount: number;
  seoScore?: number;
  aiGenerated?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  language?: string;
  count?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  categoryId: string;
  deviceTypes: string[];
  description: string;
  language?: string;
}

export interface Settings {
  siteName: string;
  siteUrl: string;
  /** Never persisted to Supabase or returned by the admin settings API. Use OPENROUTER_API_KEY env var. */
  openRouterApiKey: string;
  defaultAiModel: string;
  language: string;
  logoUrl?: string;
  faviconUrl?: string;
  googleAnalyticsId?: string;
  googleSearchConsoleTag?: string;
  googleSearchConsoleMeta?: string;
  adsTxtContent?: string;
  adsTxt?: string;
  robotsTxtContent?: string;
  robotsTxt?: string;
  defaultLanguage?: string;
  sitemapSettings?: {
    autoUpdate: boolean;
    includeImages: boolean;
  };
  automationActive?: boolean;
  automationIntervalMinutes?: number;
  automationLanguages?: string[];
  automationPublishStatus?: 'published' | 'draft';
  automationModel?: string;
  lastAutomationRunTime?: string;
  automationCount?: number;
  automationLogs?: Array<{ id: string; time: string; text: string; type: 'info' | 'success' | 'error' }>;
}

export interface AiGenerationLog {
  id: string;
  errorCode: string;
  brand: string;
  device: string;
  model: string;
  createdAt: string;
  status: 'completed' | 'failed';
}

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  updatedAt: string;
}
