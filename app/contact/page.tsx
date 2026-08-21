import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { ContactForm } from '@/components/ContactForm';
import { Mail, Clock, HelpCircle, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact Support & Inquiries - ErrorCodeWiki',
  description: 'Get in touch with the ErrorCodeWiki team to submit error code corrections, hardware manuals, or general inquiries.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <Breadcrumbs items={[{ label: 'Contact Us' }]} />

        <div className="space-y-8">
          
          {/* Header */}
          <div className="border-b border-gray-300 pb-6">
            <div className="flex items-center gap-2 text-blue-700 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Mail className="w-4 h-4" />
              <span>Diagnostic Support & Inquiries</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Contact ErrorCodeWiki Team
            </h1>
            <p className="text-gray-600 text-sm mt-2">
              Have an error code correction, hardware manual submission, advertising inquiry, or feedback? Get in touch with our technical team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Form Column */}
            <div className="md:col-span-2">
              <div className="bg-[#f8f9fa] border border-[#a2a9b1] p-6 rounded-xs shadow-2xs">
                <ContactForm />
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
              
              {/* Direct Info Card */}
              <div className="bg-white border border-gray-300 p-4 rounded-xs text-xs space-y-3">
                <h3 className="font-serif font-bold text-sm text-gray-900 border-b border-gray-200 pb-1.5">
                  Direct Diagnostic Contacts
                </h3>
                
                <div className="space-y-2 text-gray-700">
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-gray-900">Email Technical Desk:</span>
                      <a href="mailto:support@errorcodewiki.ai.studio" className="text-blue-700 hover:underline font-mono">
                        support@errorcodewiki.ai.studio
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
                    <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-gray-900">Response SLA:</span>
                      <span className="text-gray-600">Mon–Fri: 24–48 Business Hours</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
                    <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-gray-900">Privacy Notice:</span>
                      <span className="text-gray-600">Your email address will only be used to reply to your inquiry.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-[#f8f9fa] border border-[#a2a9b1] p-4 rounded-xs text-xs space-y-2">
                <h3 className="font-serif font-bold text-sm text-gray-900 border-b border-gray-200 pb-1 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-gray-700" />
                  <span>Frequently Needed Pages</span>
                </h3>
                <ul className="space-y-1.5 text-blue-700 font-medium">
                  <li><Link href="/about" className="hover:underline">About ErrorCodeWiki Mission →</Link></li>
                  <li><Link href="/privacy" className="hover:underline">Read Privacy & Cookies Policy →</Link></li>
                  <li><Link href="/terms" className="hover:underline">Terms of Service →</Link></li>
                  <li><Link href="/disclaimer" className="hover:underline">Hardware Safety Disclaimer →</Link></li>
                </ul>
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
