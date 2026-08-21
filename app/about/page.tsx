import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { BookOpen, Search, Cpu, CheckCircle2, ShieldCheck, Zap, Layers, Sparkles, HelpCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About Us | ErrorCodeWiki Universal Diagnostic Repository',
  description: 'Discover ErrorCodeWiki: The open, fast, comprehensive diagnostic repository for software error codes, OBD-II vehicle trouble codes, printer errors, and hardware maintenance manuals.',
  openGraph: {
    title: 'About Us | ErrorCodeWiki',
    description: 'Learn about ErrorCodeWiki mission, technical standards, and diagnostic documentation database.',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <Breadcrumbs items={[{ label: 'About Us' }]} />

        <article className="prose prose-gray max-w-none space-y-8">
          
          {/* Header */}
          <div className="border-b border-gray-300 pb-6">
            <div className="flex items-center gap-2 text-blue-700 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4" />
              <span>Universal Diagnostic Encyclopedia</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              About ErrorCodeWiki
            </h1>
            <p className="text-gray-600 text-sm mt-2">
              Democratizing technical troubleshooting manuals for software, hardware, vehicles, and appliances worldwide.
            </p>
          </div>

          {/* Mission Hero Banner */}
          <div className="bg-[#f8f9fa] border border-[#a2a9b1] p-6 rounded-xs space-y-3">
            <h2 className="font-serif text-xl font-bold text-gray-900 m-0">
              Our Mission
            </h2>
            <p className="text-sm text-gray-800 leading-relaxed m-0">
              <strong>ErrorCodeWiki</strong> was founded with a clear goal: to eliminate cryptic, frustration-inducing error codes by creating a structured, lightning-fast, and verified diagnostic knowledge base. Whether an IT administrator is troubleshooting a Windows Blue Screen (BSOD <code>0x80070005</code>), a driver is reading an engine check light (OBD2 <code>P0420</code>), or a user is fixing an inkjet printer paper jam (<code>E-01</code>), ErrorCodeWiki delivers direct, step-by-step resolution steps without paywalls or filler.
            </p>
          </div>

          {/* Key Pillars Grid */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-200 pb-1">
              Core Technical Standards
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              
              <div className="bg-white border border-gray-300 p-4 rounded-xs space-y-2">
                <div className="w-8 h-8 bg-blue-100 text-blue-800 flex items-center justify-center font-bold rounded-xs mb-1">
                  <Search className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm m-0">Instant Hex & Code Lookup</h3>
                <p className="text-gray-600 leading-relaxed m-0">
                  Engineered with a high-speed search index capable of instantly mapping hexadecimal, alphanumeric, and HTTP status codes to specific manufacturer hardware lines.
                </p>
              </div>

              <div className="bg-white border border-gray-300 p-4 rounded-xs space-y-2">
                <div className="w-8 h-8 bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold rounded-xs mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm m-0">Structured Resolution Guides</h3>
                <p className="text-gray-600 leading-relaxed m-0">
                  Every error code manual includes a clear short definition, subsystem meaning, verified causes, ordered step-by-step solutions, command-line snippets, and FAQs.
                </p>
              </div>

              <div className="bg-white border border-gray-300 p-4 rounded-xs space-y-2">
                <div className="w-8 h-8 bg-purple-100 text-purple-800 flex items-center justify-center font-bold rounded-xs mb-1">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm m-0">AI & RAG Ready Indexing</h3>
                <p className="text-gray-600 leading-relaxed m-0">
                  Natively supports <code>llms.txt</code> and <code>llms-full.txt</code> standard endpoints, allowing modern AI search agents and LLM crawlers to ingest accurate diagnostic steps.
                </p>
              </div>

            </div>
          </div>

          {/* Supported Categories */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-200 pb-1 flex items-center gap-2">
              <Layers className="w-5 h-5 text-gray-700" />
              System Coverage & Equipment Directories
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              ErrorCodeWiki indexes technical error manuals across six primary engineering domains:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xs">
                <span className="font-bold text-gray-900 block mb-0.5">💻 Operating Systems & Software</span>
                <span className="text-gray-600">Windows BSOD, macOS Kernel Panic, Linux Systemd, Android bootloader errors.</span>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xs">
                <span className="font-bold text-gray-900 block mb-0.5">🚗 Automotive & OBD-II Diagnostics</span>
                <span className="text-gray-600">Powertrain (P), Chassis (C), Body (B), Network (U) diagnostic trouble codes.</span>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xs">
                <span className="font-bold text-gray-900 block mb-0.5">🖨️ Printers, Scanners & Copiers</span>
                <span className="text-gray-600">Epson, Canon, HP, Brother ink pad resets, paper jam resets, printhead errors.</span>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xs">
                <span className="font-bold text-gray-900 block mb-0.5">🎮 Gaming Consoles & Hardware</span>
                <span className="text-gray-600">PlayStation (CE-34878-0), Xbox Live, Nintendo Switch system update fault codes.</span>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xs">
                <span className="font-bold text-gray-900 block mb-0.5">⚡ Home Appliances & HVAC</span>
                <span className="text-gray-600">Bosch, Samsung, Whirlpool dishwasher, washer, dryer, refrigerator error codes.</span>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xs">
                <span className="font-bold text-gray-900 block mb-0.5">🌐 Networking & Web Infrastructure</span>
                <span className="text-gray-600">Cisco IOS exceptions, HTTP Status Codes (404, 500, 502, 503), DNS resolution errors.</span>
              </div>
            </div>
          </section>

          {/* Editorial Integrity */}
          <section className="space-y-3 pt-4 border-t border-gray-200">
            <h2 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gray-700" />
              Editorial Integrity & Community Submissions
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Our diagnostic database is maintained by software engineers, certified technicians, and automated AI code generation assistants. All entries undergo validation against manufacturer technical reference manuals before publication.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              Have an undocumented error code or wish to correct a repair step? Please reach out to our team via our <Link href="/contact" className="text-blue-700 font-bold hover:underline">Contact Page</Link>.
            </p>
          </section>

        </article>
      </main>

      <Footer />
    </div>
  );
}
