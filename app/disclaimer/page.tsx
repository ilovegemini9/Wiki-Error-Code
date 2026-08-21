import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { ShieldAlert, AlertOctagon, Wrench, Cpu, Car, Printer, FileCode } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Diagnostic & Safety Disclaimer | ErrorCodeWiki Technical Database',
  description: 'Official safety, accuracy, and technical non-liability disclaimer for error code troubleshooting guides on ErrorCodeWiki.',
  openGraph: {
    title: 'Disclaimer | ErrorCodeWiki',
    description: 'Important safety and liability disclaimer for technical error code documentation.',
  },
};

export default function DisclaimerPage() {
  const lastUpdated = 'August 2, 2026';

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <Breadcrumbs items={[{ label: 'Disclaimer' }]} />

        <article className="prose prose-gray max-w-none space-y-8">
          
          {/* Header */}
          <div className="border-b border-gray-300 pb-6">
            <div className="flex items-center gap-2 text-amber-700 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <ShieldAlert className="w-4 h-4" />
              <span>Technical Liability & Safety Warning</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Diagnostic & Technical Disclaimer
            </h1>
            <p className="text-gray-600 text-sm mt-2">
              Effective Date: <time dateTime="2026-08-02">{lastUpdated}</time> | Read Before Performing Hardware or Software Repairs
            </p>
          </div>

          {/* Important Callout Box */}
          <div className="bg-amber-50 border-2 border-amber-300 p-5 rounded-xs text-xs text-amber-950 space-y-3 shadow-2xs">
            <div className="font-bold flex items-center gap-2 text-sm text-amber-900">
              <AlertOctagon className="w-5 h-5 text-amber-700 shrink-0" />
              <span>Critical Warning Before You Attempt Any Fix:</span>
            </div>
            <p className="leading-relaxed">
              <strong>ErrorCodeWiki</strong> is an independent diagnostic documentation repository. Technical procedures published on this platform—such as registry edits, terminal commands, printer ink-absorber resets, appliance motherboard testing, and OBD-II vehicle fault code clearing—are intended for reference by trained personnel or knowledgeable enthusiasts. <strong>Proceed with caution and at your own risk.</strong>
            </p>
          </div>

          {/* Category-Specific Disclaimers */}
          <div className="space-y-6">
            <h2 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-200 pb-1">
              Category-Specific Risk Disclaimers
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Automotive */}
              <div className="bg-gray-50 border border-gray-300 p-4 rounded-xs space-y-2">
                <div className="font-bold text-gray-900 flex items-center gap-1.5 text-sm">
                  <Car className="w-4 h-4 text-blue-700" />
                  <span>Automotive OBD-II Trouble Codes</span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Engine Diagnostic Trouble Codes (DTCs like P0300, P0420) indicate system symptoms, not necessarily single faulty parts. Clearing codes with a scanner does not fix mechanical wear. Driving a vehicle with active engine or brake faults can cause catastrophic engine damage or road accidents. Always consult a certified ASE mechanic.
                </p>
              </div>

              {/* Hardware & Appliances */}
              <div className="bg-gray-50 border border-gray-300 p-4 rounded-xs space-y-2">
                <div className="font-bold text-gray-900 flex items-center gap-1.5 text-sm">
                  <Wrench className="w-4 h-4 text-red-700" />
                  <span>Appliances & High-Voltage Equipment</span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Home appliances (washing machines, dishwashers, microwaves, HVAC units) operate under high voltage (110V–240V AC) and stored capacitor power. Disconnect main power breakers before disassembling units. Improper wiring can cause electrical fires or electrocution.
                </p>
              </div>

              {/* Operating Systems */}
              <div className="bg-gray-50 border border-gray-300 p-4 rounded-xs space-y-2">
                <div className="font-bold text-gray-900 flex items-center gap-1.5 text-sm">
                  <Cpu className="w-4 h-4 text-emerald-700" />
                  <span>Windows BSOD & Operating System Files</span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Modifying system registries (<code>regedit</code>), executing disk partitioning tools, or flashing motherboard BIOS/firmware can render operating systems unbootable. Always create a full System Restore Point and backup critical personal files prior to executing command-line instructions.
                </p>
              </div>

              {/* Printers & Consoles */}
              <div className="bg-gray-50 border border-gray-300 p-4 rounded-xs space-y-2">
                <div className="font-bold text-gray-900 flex items-center gap-1.5 text-sm">
                  <Printer className="w-4 h-4 text-purple-700" />
                  <span>Printers & Gaming Consoles</span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Opening printer housings or gaming console covers (PS5, Xbox, Switch) may void official manufacturer warranty seals. Inkjet maintenance procedures involving printhead manual cleaning solvents should be handled with protective gear to avoid chemical stains or board short-circuits.
                </p>
              </div>

            </div>
          </div>

          {/* Trademark Non-Affiliation */}
          <section className="space-y-3 pt-4 border-t border-gray-200">
            <h2 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-gray-700" />
              Trademark Non-Affiliation Notice
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong>ErrorCodeWiki</strong> is an independent diagnostic documentation portal and is <strong>NOT affiliated, associated, authorized, endorsed by, or in any way officially connected</strong> with Microsoft Corporation, Canon Inc., Seiko Epson Corporation, HP Inc., Toyota Motor Corporation, Sony Interactive Entertainment, Cisco Systems, or any of their subsidiaries or affiliates. All product and company names are trademarks™ or registered® trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them.
            </p>
          </section>

          {/* Warranty Disclaimer */}
          <section className="space-y-3 pt-4 border-t border-gray-200">
            <h2 className="font-serif text-xl font-bold text-gray-900">
              No Warranties & Limitation of Liability
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              ALL INFORMATION ON ERRORCODEWIKI IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. IN NO EVENT SHALL ERRORCODEWIKI BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, CONSEQUENTIAL, OR INCIDENTAL DAMAGES WHATSOEVER.
            </p>
            <p className="text-sm text-gray-700">
              If you discover an error or inaccuracy in any diagnostic guide, please report it via our <Link href="/contact" className="text-blue-700 font-bold hover:underline">Contact Page</Link>.
            </p>
          </section>

        </article>
      </main>

      <Footer />
    </div>
  );
}
