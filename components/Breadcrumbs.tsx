import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: React.ReactNode;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const getLabelText = (label: any): string => {
    if (typeof label === 'string') return label;
    if (typeof label === 'number') return String(label);
    if (!label) return '';
    if (typeof label === 'object') {
      if (label.props?.children) {
        return getLabelText(label.props.children);
      }
      if (Array.isArray(label)) {
        return label.map(getLabelText).filter(Boolean).join(' ');
      }
    }
    return '';
  };

  const jsonLdElements = (items || [])
    .filter(Boolean)
    .map((item, idx) => {
      const nameText = getLabelText(item.label) || 'Page';
      return {
        "@type": "ListItem",
        "position": idx + 2,
        "name": nameText,
        ...(item.href ? { "item": `https://errorcodewiki.org${item.href}` } : {})
      };
    });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://errorcodewiki.org"
      },
      ...jsonLdElements
    ]
  };

  let jsonLdString = '';
  try {
    jsonLdString = JSON.stringify(jsonLd);
  } catch {
    jsonLdString = '';
  }

  return (
    <>
      {jsonLdString && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString }}
        />
      )}
      <nav aria-label="Breadcrumb" className="my-3 text-xs text-gray-600 font-sans flex items-center flex-wrap gap-1 border-b border-gray-100 pb-2">
        <Link href="/" className="inline-flex items-center gap-1 text-gray-600 hover:text-blue-700 hover:underline">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        {(items || []).map((item, index, arr) => {
          const isLast = index === arr.length - 1;
          return (
            <div key={index} className="flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-gray-400" />
              {isLast || !item.href ? (
                <span className="font-semibold text-gray-900">{item.label}</span>
              ) : (
                <Link href={item.href} className="text-gray-600 hover:text-blue-700 hover:underline">
                  {item.label}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}
