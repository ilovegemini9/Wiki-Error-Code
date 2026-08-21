export interface LanguageOption {
  code: string;        // 'en', 'fr', 'es', 'de', 'ja', 'it', 'pt', 'nl', 'zh'
  name: string;        // 'English', 'Français', 'Español', 'Deutsch', '日本語', 'Italiano', 'Português', 'Nederlands', '中文'
  englishName: string; // 'English', 'French', 'Spanish', 'German', 'Japanese', 'Italian', 'Portuguese', 'Dutch', 'Chinese'
  flag: string;        // Emoji flag icon
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', englishName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', englishName: 'French', flag: '🇫🇷' },
  { code: 'es', name: 'Español', englishName: 'Spanish', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', englishName: 'German', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', englishName: 'Japanese', flag: '🇯🇵' },
  { code: 'it', name: 'Italiano', englishName: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', englishName: 'Portuguese', flag: '🇵🇹' },
  { code: 'nl', name: 'Nederlands', englishName: 'Dutch', flag: '🇳🇱' },
  { code: 'zh', name: '中文', englishName: 'Chinese', flag: '🇨🇳' },
];

export function getLanguageByCode(code: string): LanguageOption {
  if (!code) return SUPPORTED_LANGUAGES[0];
  const clean = code.toLowerCase().trim().split('-')[0];
  return (
    SUPPORTED_LANGUAGES.find(l => l.code === clean || l.englishName.toLowerCase() === clean || l.name.toLowerCase() === clean) ||
    SUPPORTED_LANGUAGES[0]
  );
}

export function detectBrowserLanguage(): string {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem('user_lang');
    if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
      return saved;
    }
    const navLangs = navigator.languages || [navigator.language || 'en'];
    for (const l of navLangs) {
      if (!l) continue;
      const code = l.toLowerCase().split('-')[0];
      if (SUPPORTED_LANGUAGES.some(sl => sl.code === code)) {
        return code;
      }
    }
  } catch {
    // ignore
  }
  return 'en';
}
