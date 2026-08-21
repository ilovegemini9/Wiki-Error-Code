import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-300 text-gray-700 font-sans text-xs pt-10 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-gray-200">
          
          {/* Col 1 */}
          <div className="space-y-2">
            <h3 className="font-serif font-bold text-gray-900 text-sm">ErrorCodeWiki</h3>
            <p className="text-gray-600 leading-relaxed">
              A minimalist, open diagnostic encyclopedia covering software, operating systems, electronics, home appliances, printers, cars, and network hardware.
            </p>
            <p className="text-gray-500 text-[11px] font-mono pt-1">
              Text available under Wikipedia Creative Commons License.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-semibold text-gray-900 uppercase tracking-wider text-[11px] mb-3">Popular Categories</h4>
            <ul className="space-y-1.5 text-gray-600">
              <li><Link href="/category/windows" className="hover:text-blue-700 hover:underline">Windows BSOD & Update</Link></li>
              <li><Link href="/category/printers" className="hover:text-blue-700 hover:underline">Printers (Canon, Epson, HP)</Link></li>
              <li><Link href="/category/cars" className="hover:text-blue-700 hover:underline">Cars & OBD2 Diagnostics</Link></li>
              <li><Link href="/category/gaming" className="hover:text-blue-700 hover:underline">PlayStation & Xbox</Link></li>
              <li><Link href="/category/programming" className="hover:text-blue-700 hover:underline">HTTP Status Codes & PHP</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="font-semibold text-gray-900 uppercase tracking-wider text-[11px] mb-3">Popular Brands</h4>
            <ul className="space-y-1.5 text-gray-600">
              <li><Link href="/brand/microsoft" className="hover:text-blue-700 hover:underline">Microsoft</Link></li>
              <li><Link href="/brand/canon" className="hover:text-blue-700 hover:underline">Canon</Link></li>
              <li><Link href="/brand/toyota" className="hover:text-blue-700 hover:underline">Toyota</Link></li>
              <li><Link href="/brand/playstation" className="hover:text-blue-700 hover:underline">Sony PlayStation</Link></li>
              <li><Link href="/brand/cisco" className="hover:text-blue-700 hover:underline">Cisco Systems</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="font-semibold text-gray-900 uppercase tracking-wider text-[11px] mb-3">SEO, AI & Legal</h4>
            <ul className="space-y-1.5 text-gray-600 text-[11px]">
              <li><Link href="/about" className="hover:text-blue-700 hover:underline">About ErrorCodeWiki</Link></li>
              <li><Link href="/contact" className="hover:text-blue-700 hover:underline">Contact Support Desk</Link></li>
              <li><a href="/llms.txt" target="_blank" className="font-mono hover:text-blue-700 hover:underline">llms.txt (AI Search Feed)</a></li>
              <li><a href="/sitemap.xml" target="_blank" className="font-mono hover:text-blue-700 hover:underline">sitemap.xml</a></li>
              <li><a href="/rss.xml" target="_blank" className="font-mono hover:text-blue-700 hover:underline">rss.xml Feed</a></li>
              <li className="pt-2">
                <Link href="/admin/login" className="text-blue-800 font-sans font-bold hover:underline">
                  🔒 Admin Portal
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500">
          <div>
            © {new Date().getFullYear()} ErrorCodeWiki. Clean, fast, SEO-first diagnostic manual.
          </div>
          <div className="flex flex-wrap gap-4 text-gray-600">
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/disclaimer" className="hover:underline">Disclaimer</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
