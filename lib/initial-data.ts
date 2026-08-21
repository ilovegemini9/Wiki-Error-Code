import { Category, Brand, Article, Settings } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'windows', name: 'Windows', slug: 'windows', icon: 'Monitor', description: 'Windows Operating System errors, BSOD codes, and System Update failures.' },
  { id: 'linux', name: 'Linux', slug: 'linux', icon: 'Terminal', description: 'Linux kernel panics, package manager issues, and permission errors.' },
  { id: 'android', name: 'Android', slug: 'android', icon: 'Smartphone', description: 'Android OS errors, Google Play Store download failures, and Fastboot codes.' },
  { id: 'iphone', name: 'iPhone & iOS', slug: 'iphone', icon: 'Apple', description: 'Apple iPhone, iPad, iTunes, and iOS restore and update error codes.' },
  { id: 'printers', name: 'Printers', slug: 'printers', icon: 'Printer', description: 'Hardware error codes for Canon, Epson, HP, and Brother printers.' },
  { id: 'cars', name: 'Cars & Vehicles', slug: 'cars', icon: 'Car', description: 'OBD-II diagnostic error codes for Toyota, BMW, Mercedes, and other vehicles.' },
  { id: 'gaming', name: 'Gaming Consoles', slug: 'gaming', icon: 'Gamepad2', description: 'PlayStation, Xbox, and Nintendo Switch error codes and system freezes.' },
  { id: 'networking', name: 'Networking Equipment', slug: 'networking', icon: 'Network', description: 'Cisco IOS, Mikrotik RouterOS, router and switch network error messages.' },
  { id: 'programming', name: 'Programming Languages', slug: 'programming', icon: 'Code', description: 'HTTP status codes, PHP runtime errors, Node.js errors, and Python exceptions.' },
  { id: 'database', name: 'Databases', slug: 'database', icon: 'Database', description: 'MySQL, PostgreSQL, and Microsoft SQL Server error codes and queries.' },
];

export const INITIAL_BRANDS: Brand[] = [
  { id: 'microsoft', name: 'Microsoft', slug: 'microsoft', categoryId: 'windows', deviceTypes: ['PC', 'Laptop', 'Xbox', 'Server'], description: 'Microsoft Windows OS and Xbox gaming hardware.' },
  { id: 'canon', name: 'Canon', slug: 'canon', categoryId: 'printers', deviceTypes: ['Inkjet Printer', 'Laser Printer', 'Multifunction'], description: 'Canon PIXMA, MAXIFY, and imageCLASS printers.' },
  { id: 'epson', name: 'Epson', slug: 'epson', categoryId: 'printers', deviceTypes: ['EcoTank Printer', 'WorkForce Printer'], description: 'Epson EcoTank and WorkForce series error codes.' },
  { id: 'hp', name: 'HP', slug: 'hp', categoryId: 'printers', deviceTypes: ['LaserJet', 'OfficeJet', 'DeskJet'], description: 'HP LaserJet and OfficeJet printer diagnostic messages.' },
  { id: 'brother', name: 'Brother', slug: 'brother', categoryId: 'printers', deviceTypes: ['Mono Laser', 'Color Laser', 'Scanner'], description: 'Brother printer hardware and maintenance errors.' },
  { id: 'toyota', name: 'Toyota', slug: 'toyota', categoryId: 'cars', deviceTypes: ['Sedan', 'SUV', 'Hybrid', 'Truck'], description: 'Toyota OBD2 diagnostic trouble codes and engine check lights.' },
  { id: 'bmw', name: 'BMW', slug: 'bmw', categoryId: 'cars', deviceTypes: ['Sedan', 'Coupe', 'SUV'], description: 'BMW fault codes, DME errors, and OBD-II diagnostics.' },
  { id: 'mercedes', name: 'Mercedes-Benz', slug: 'mercedes', categoryId: 'cars', deviceTypes: ['Sedan', 'SUV', 'Van'], description: 'Mercedes diagnostic fault codes and SAM module codes.' },
  { id: 'sony-playstation', name: 'PlayStation', slug: 'playstation', categoryId: 'gaming', deviceTypes: ['PS5', 'PS4', 'PS VR'], description: 'Sony PlayStation 4 and PlayStation 5 system error codes.' },
  { id: 'nintendo', name: 'Nintendo', slug: 'nintendo', categoryId: 'gaming', deviceTypes: ['Nintendo Switch', '3DS'], description: 'Nintendo Switch network and system update error codes.' },
  { id: 'cisco', name: 'Cisco', slug: 'cisco', categoryId: 'networking', deviceTypes: ['Switch', 'Router', 'Firewall'], description: 'Cisco IOS system messages, log codes, and boot flags.' },
  { id: 'mikrotik', name: 'Mikrotik', slug: 'mikrotik', categoryId: 'networking', deviceTypes: ['RouterBoard', 'CCR', 'Switch'], description: 'Mikrotik RouterOS error codes and API exceptions.' },
  { id: 'http-spec', name: 'HTTP Standard', slug: 'http', categoryId: 'programming', deviceTypes: ['Web Server', 'REST API', 'Browser'], description: 'Standard HTTP status response codes (4xx, 5xx).' },
  { id: 'mysql', name: 'MySQL', slug: 'mysql', categoryId: 'database', deviceTypes: ['Database Server', 'MariaDB'], description: 'MySQL server error messages and SQL state codes.' },
  { id: 'postgresql', name: 'PostgreSQL', slug: 'postgresql', categoryId: 'database', deviceTypes: ['PostgreSQL Server'], description: 'PostgreSQL error codes and transaction rollbacks.' },
  { id: 'apple', name: 'Apple', slug: 'apple', categoryId: 'iphone', deviceTypes: ['iPhone', 'iPad', 'Mac'], description: 'Apple iOS restore, update, and hardware error codes.' },
];

export const INITIAL_SETTINGS: Settings = {
  siteName: 'ErrorCodeWiki',
  siteUrl: 'https://errorcodewiki.ai.studio/',
  openRouterApiKey: '',
  defaultAiModel: 'google/gemma-4-31b-it',
  language: 'en',
  logoUrl: '',
  faviconUrl: '',
  googleAnalyticsId: '',
  googleSearchConsoleTag: 'googlea4a6cf77ebec56e8',
  googleSearchConsoleMeta: 'google-site-verification=googlea4a6cf77ebec56e8',
  adsTxt: '',
  robotsTxt: `User-agent: *
Allow: /
Sitemap: https://errorcodewiki.ai.studio/sitemap.xml`,
  sitemapSettings: {
    autoUpdate: true,
    includeImages: true,
  }
};

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-win-0x80070005',
    errorCode: '0x80070005',
    title: 'Windows Error 0x80070005: Access Denied Fix',
    slug: 'windows-0x80070005',
    metaTitle: 'How to Fix Windows Error 0x80070005 (Access Denied) - Step-by-Step',
    metaDescription: 'Learn how to resolve Windows Update Error 0x80070005 (Access Denied) with our tested step-by-step repair guide for Windows 10 and Windows 11.',
    shortDefinition: 'Windows Error 0x80070005 is a permission denied error that occurs when Windows Update, System Restore, or an installer lacks administrative file system permissions.',
    meaning: 'Error 0x80070005 translates directly to ERROR_ACCESS_DENIED in Win32 error codes. It indicates that the operating system process attempting to execute a system modification (such as downloading updates, registering a DLL, or restoring system files) was blocked due to insufficient NTFS file permissions or strict registry ACL security policies.',
    causes: [
      'Current Windows user account lacks administrative permissions.',
      'Third-party antivirus or firewall software blocking system file modifications.',
      'Corrupted Windows Update cache files in the C:\\Windows\\SoftwareDistribution folder.',
      'Corrupted Security ACL permissions in C:\\Windows or Registry hives.',
      'Group Policy restrictions enforced by domain or administrator settings.'
    ],
    solutions: [
      {
        title: 'Run Windows Update Troubleshooter as Administrator',
        description: 'Windows built-in diagnostic tool can automatically reset security descriptors for Windows Update services.',
        steps: [
          'Press Windows Key + I to open Settings.',
          'Navigate to System > Troubleshoot > Other troubleshooters.',
          'Find "Windows Update" and click "Run".',
          'Follow the on-screen prompts and restart your PC.'
        ]
      },
      {
        title: 'Reset Windows Update Components via Command Prompt',
        description: 'Clearing corrupted update caches and re-registering core DLLs resolves the majority of 0x80070005 errors.',
        steps: [
          'Press Windows Key + X and choose "Terminal (Admin)" or "Command Prompt (Admin)".',
          'Execute the following commands one by one to stop services and clear SoftwareDistribution:'
        ],
        codeSnippet: `net stop wuauserv
net stop cryptSvc
net stop bits
net stop msiserver
ren C:\\Windows\\SoftwareDistribution SoftwareDistribution.old
ren C:\\Windows\\System32\\catroot2 catroot2.old
net start wuauserv
net start cryptSvc
net start bits
net start msiserver`
      },
      {
        title: 'Reset File and Registry Permissions with SubInACL',
        description: 'If file security descriptors are severely corrupted, SubInACL resets default access rights for SYSTEM and Administrators.'
      }
    ],
    technicalExplanation: 'The HRESULT code 0x80070005 consists of the facility code 0x007 (Win32) and error code 0x0005 (Access Denied). When a thread calls SetNamedSecurityInfo or attempts write access to HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Component Based Servicing without WRITE_DAC permissions, kernel-mode security checks generate STATUS_ACCESS_DENIED.',
    faq: [
      {
        question: 'Does Error 0x80070005 mean I have a malware infection?',
        answer: 'Not necessarily. While some malware alters file permissions to protect itself, 0x80070005 is most commonly triggered by interrupted Windows updates or antivirus conflicts.'
      },
      {
        question: 'Will resetting Windows fix Error 0x80070005?',
        answer: 'Yes, performing a Windows Reset while keeping your files will recreate default registry ACLs and repair corrupt system files.'
      }
    ],
    categoryId: 'windows',
    brandId: 'microsoft',
    deviceType: 'Windows 10 / 11 PC',
    language: 'en',
    keywords: ['0x80070005', 'windows update error', 'access denied windows 11', 'error 0x80070005 fix'],
    tags: ['Windows 11', 'Windows 10', 'Windows Update', 'BSOD', 'Permissions'],
    status: 'published',
    readingTime: '4 min read',
    internalLinks: [
      { title: 'Windows Error 0x80070002', url: '/error/windows-0x80070002', anchorText: 'Fix Windows Error 0x80070002' },
      { title: 'HTTP 403 Forbidden', url: '/error/http-403', anchorText: 'HTTP 403 Forbidden Error' }
    ],
    createdAt: '2026-07-15T10:00:00.000Z',
    updatedAt: '2026-08-01T14:20:00.000Z',
    viewsCount: 1420
  },
  {
    id: 'art-epson-e01',
    errorCode: 'E-01',
    title: 'Epson Printer Error E-01: Scanner Unit Error Fix',
    slug: 'epson-e01',
    metaTitle: 'How to Fix Epson Printer Error E-01 (Scanner Unit Jam / Motor Failure)',
    metaDescription: 'Complete repair guide for Epson E-01 printer error code. Learn how to remove carriage obstructions, reset sensor ribbon cables, and restore printing.',
    shortDefinition: 'Epson Error E-01 indicates a critical scanner motor obstruction, carriage jam, or fatal hardware error preventing the scanner glass bar from zeroing.',
    meaning: 'When an Epson printer displays E-01 on its display panel, the internal main board has detected an optical scanner carriage jam or motor impedance error during initialization. The optical sensor cannot reach its home position.',
    causes: [
      'Packing tape, protective plastic, or paper scraps jammed inside scanner mechanism.',
      'Foreign objects (paperclips, staple) stuck along the scanner transport rail.',
      'Disconnected or misaligned scanner ribbon flat cable (FFC cable).',
      'Defective scanner stepper motor or failed optical sensor.'
    ],
    solutions: [
      {
        title: 'Inspect and Remove Foreign Objects',
        description: 'Check inside the scanner unit for paper fragments or shipping locks.',
        steps: [
          'Turn off the printer and disconnect the power cable.',
          'Lift the scanner lid and inspect the scanner rail from left to right.',
          'Gently remove any trapped paper or tape using tweezers if necessary.',
          'Close the unit, reconnect power, and switch on.'
        ]
      },
      {
        title: 'Perform Hard Power Reset',
        description: 'Clears lingering error flags in the printer NVRAM memory buffer.',
        steps: [
          'Disconnect power plug while the machine is turned ON.',
          'Press and hold the Power button for 60 seconds to drain capacitors.',
          'Wait 5 minutes before reconnecting power directly to a wall socket.'
        ]
      }
    ],
    technicalExplanation: 'The printer main board measures voltage feedback from the scanner carriage optical encoder. If encoder pulse count fails to increment within 1200ms after applying drive voltage to the stepping motor, firmware raises Fatal Code 0x9A / E-01.',
    faq: [
      {
        question: 'Is Epson E-01 repairable at home?',
        answer: 'Yes, over 80% of E-01 errors are caused by small paper jams or unseated ribbon cables that can be cleared without professional tools.'
      }
    ],
    categoryId: 'printers',
    brandId: 'epson',
    deviceType: 'Epson EcoTank & WorkForce',
    language: 'en',
    keywords: ['epson e01', 'epson error e-01', 'scanner unit error epson', 'epson ecotank error'],
    tags: ['Epson', 'Printer Error', 'EcoTank', 'Hardware Repair'],
    status: 'published',
    readingTime: '3 min read',
    internalLinks: [
      { title: 'Canon Error E05', url: '/error/canon-e05', anchorText: 'Canon Error E05 Guide' },
      { title: 'HP Error 79', url: '/error/hp-error-79', anchorText: 'HP Laserjet Error 79' }
    ],
    createdAt: '2026-07-18T12:00:00.000Z',
    updatedAt: '2026-08-01T11:00:00.000Z',
    viewsCount: 890
  },
  {
    id: 'art-http-404',
    errorCode: '404',
    title: 'HTTP 404 Not Found Status Code: Causes & Solution',
    slug: 'http-404',
    metaTitle: 'HTTP Error 404 Not Found - What It Means & How to Fix It',
    metaDescription: 'Detailed technical explanation of HTTP 404 Not Found error code for web developers and site visitors. Solutions for Nginx, Apache, and Next.js.',
    shortDefinition: 'HTTP 404 Not Found is a client-side HTTP response status code indicating that the server cannot locate the requested URL web page or resource.',
    meaning: 'The HTTP 404 status code means the client was able to establish communication with the target host server over HTTP/HTTPS, but the server could not locate a matching route, file, or resource corresponding to the requested Uniform Resource Identifier (URI).',
    causes: [
      'URL mistyped by user or outdated broken link on referring page.',
      'File or resource deleted or moved to a different directory without 301 redirect.',
      'URL rewriting rules misconfigured in Nginx (.conf), Apache (.htaccess), or IIS.',
      'Domain Name System (DNS) propagation pending or mispointed host record.'
    ],
    solutions: [
      {
        title: 'Verify URL Spelling and Path Structure',
        description: 'Double check character casing, trailing slashes, and file extensions (.html vs .php).'
      },
      {
        title: 'Configure 301 Permanent Redirects',
        description: 'Map old deleted pages to relevant active routes using Nginx or htaccess:',
        codeSnippet: `# Apache .htaccess 301 Redirect
Redirect 301 /old-page.html /new-page/

# Nginx rewrite block
location /old-page {
    return 301 https://example.com/new-page;
}`
      }
    ],
    technicalExplanation: 'RFC 7231 Section 6.5.4 specifies 404 Not Found as an explicit payload indicating that the origin server did not find a current representation for the target resource. Unlike 410 Gone, 404 does not declare whether the condition is temporary or permanent.',
    faq: [
      {
        question: 'Does a 404 error hurt SEO rankings?',
        answer: 'A reasonable number of 404 errors for deleted pages is normal. However, broken internal links leading to 404s waste crawl budget and harm user experience.'
      }
    ],
    categoryId: 'programming',
    brandId: 'http-spec',
    deviceType: 'Web Applications & REST APIs',
    language: 'en',
    keywords: ['http 404', '404 not found', 'fix 404 error', 'nginx 404 not found'],
    tags: ['HTTP Status', 'Web Server', 'SEO', 'REST API'],
    status: 'published',
    readingTime: '3 min read',
    internalLinks: [
      { title: 'HTTP 500 Internal Server Error', url: '/error/http-500', anchorText: 'HTTP 500 Server Error' },
      { title: 'HTTP 502 Bad Gateway', url: '/error/http-502', anchorText: 'HTTP 502 Bad Gateway' }
    ],
    createdAt: '2026-07-10T08:00:00.000Z',
    updatedAt: '2026-08-02T08:15:00.000Z',
    viewsCount: 3200
  },
  {
    id: 'art-toyota-p0420',
    errorCode: 'P0420',
    title: 'Toyota OBD-II Error Code P0420: Catalyst System Efficiency Below Threshold',
    slug: 'toyota-p0420',
    metaTitle: 'Toyota Error Code P0420 Diagnosis & Repair Guide (Catalytic Converter)',
    metaDescription: 'Step-by-step diagnostic guide for Toyota P0420 fault code. Learn how to diagnose O2 sensors, exhaust leaks, and catalytic converter efficiency.',
    shortDefinition: 'OBD-II Code P0420 indicates that the Bank 1 catalytic converter operating efficiency has dropped below the minimum acceptable threshold dictated by the ECM.',
    meaning: 'The Engine Control Module (ECM) uses upstream (Air-Fuel Ratio) and downstream (O2) oxygen sensors to monitor catalytic converter performance. When the voltage signal from the downstream sensor begins mirroring the fluctuating upstream sensor signal, the ECM infers that oxygen storage capacity has degraded.',
    causes: [
      'Deteriorated or contaminated catalytic converter matrix.',
      'Faulty downstream oxygen sensor (Bank 1 Sensor 2).',
      'Exhaust manifold or front exhaust pipe leaks upstream of O2 sensor.',
      'Engine misfires (P0300) allowing raw unburned fuel into exhaust system.',
      'Engine coolant temp sensor malfunction causing rich fuel mixture.'
    ],
    solutions: [
      {
        title: 'Check Exhaust System for Leaks',
        description: 'Inspect exhaust flex pipe and manifold gaskets for soot carbon tracing or cracks before replacing expensive components.',
        steps: [
          'Safely elevate vehicle on jack stands.',
          'Start engine and listen for ticking exhaust leaks near manifold.',
          'Inspect O2 sensor mounting bungs for rusting or looseness.'
        ]
      },
      {
        title: 'Diagnose Downstream O2 Sensor Live Data',
        description: 'Connect an OBD2 scanner and monitor Bank 1 Sensor 2 voltage waveform while cruising at 2000 RPM.',
        codeSnippet: `Ideal Downstream O2 Voltage: Steady 0.6V - 0.8V DC line.
Failing Converter Signal: Rapid oscillation matching Upstream (0.1V to 0.9V).`
      }
    ],
    technicalExplanation: 'The ECM calculates Oxygen Storage Capacity (OSC). If OSC value drops below 0.25 on 3 consecutive driving cycles under closed-loop steady state (45-65 MPH), DTC P0420 is stored in ECU memory and Check Engine Light illuminates.',
    faq: [
      {
        question: 'Is it safe to drive my Toyota with a P0420 code?',
        answer: 'Yes, driving short distances is safe, but prolonged driving with a clogged converter can cause engine backpressure, reduced fuel economy, and potential overheating.'
      }
    ],
    categoryId: 'cars',
    brandId: 'toyota',
    deviceType: 'Toyota Camry, Corolla, RAV4, Prius',
    language: 'en',
    keywords: ['p0420 toyota', 'toyota error code p0420', 'p0420 catalytic converter', 'check engine light p0420'],
    tags: ['OBD2', 'Toyota', 'Check Engine Light', 'Catalytic Converter'],
    status: 'published',
    readingTime: '5 min read',
    internalLinks: [
      { title: 'Toyota Error P0300', url: '/error/toyota-p0300', anchorText: 'Toyota P0300 Misfire Fix' },
      { title: 'BMW Fault 2A87', url: '/error/bmw-2a87', anchorText: 'BMW 2A87 VANOS Code' }
    ],
    createdAt: '2026-07-20T14:30:00.000Z',
    updatedAt: '2026-08-01T16:45:00.000Z',
    viewsCount: 2150
  },
  {
    id: 'art-ps-ce34878',
    errorCode: 'CE-34878-0',
    title: 'PlayStation Error CE-34878-0: Application Crash Repair',
    slug: 'playstation-ce-34878-0',
    metaTitle: 'How to Fix PlayStation Error CE-34878-0 (Game Crash / Corrupted Save)',
    metaDescription: 'Fix PS4 and PS5 CE-34878-0 game crash error code instantly. Solutions for database rebuild, save file restoration, and console firmware updates.',
    shortDefinition: 'PlayStation Error CE-34878-0 is a general game crash code triggered when a PS4 or PS5 application unexpectedly crashes due to corrupted game memory or software conflict.',
    meaning: 'The PlayStation System Software (Orbis/Prospero OS) forces application closure when an unhandled memory exception, segmentation fault, or corrupted asset index occurs within a active gaming session.',
    causes: [
      'Corrupted game update file or save data partition.',
      'Outdated PlayStation system software or pending firmware update.',
      'Corrupted database indexing on the internal HDD / SSD.',
      'Facilitated overheating or failing internal hard drive sector.'
    ],
    solutions: [
      {
        title: 'Restart Game and Console',
        description: 'Completely close the application from the home screen options menu and power cycle your PlayStation console.'
      },
      {
        title: 'Rebuild PlayStation Database in Safe Mode',
        description: 'Rebuilding the system database cleans up fragmented indices without deleting installed games or saves.',
        steps: [
          'Turn off console completely until power light stops flashing.',
          'Press and hold Power button for 7 seconds until you hear a second beep.',
          'Connect DualShock 4 / DualSense controller via USB cable.',
          'Select Option 5: "Rebuild Database" on PS4 or Option 5: "Clear Cache and Rebuild Database" on PS5.'
        ]
      }
    ],
    technicalExplanation: 'The PlayStation OS kernel intercepts an illegal memory access instruction (SIGSEGV or SIGABRT) issued by the game executable file. It terminates the process and registers code CE-34878-0 in the error history log.',
    faq: [
      {
        question: 'Will rebuilding database delete my games or saved data?',
        answer: 'No! Rebuilding database only reorganizes system directory files. Your games, media gallery, and save files remain untouched.'
      }
    ],
    categoryId: 'gaming',
    brandId: 'sony-playstation',
    deviceType: 'PS4, PS4 Pro, PS5',
    language: 'en',
    keywords: ['ce-34878-0', 'ps4 error ce-34878-0', 'playstation crash error', 'ps5 error code ce-34878-0'],
    tags: ['PlayStation', 'PS4', 'PS5', 'Game Crash', 'Console Repair'],
    status: 'published',
    readingTime: '4 min read',
    internalLinks: [
      { title: 'Xbox Error E102', url: '/error/xbox-e102', anchorText: 'Xbox E102 System Error' },
      { title: 'Nintendo Switch 2124-4404', url: '/error/nintendo-2124-4404', anchorText: 'Nintendo Switch Network Code' }
    ],
    createdAt: '2026-07-22T09:15:00.000Z',
    updatedAt: '2026-08-01T09:00:00.000Z',
    viewsCount: 1890
  },
  {
    id: 'art-canon-e05',
    errorCode: 'E05',
    title: 'Canon Printer Error E05 (Support Code 1401 / 1403) Fix',
    slug: 'canon-e05',
    metaTitle: 'How to Fix Canon Printer Error E05 - Fine Cartridge Not Recognized',
    metaDescription: 'Step-by-step troubleshooting for Canon PIXMA E05 printer error code (Fine cartridge cannot be recognized). Easy contact cleaning and reset guide.',
    shortDefinition: 'Canon Error E05 indicates that the printer fine print cartridge (black or color) cannot be recognized or is improperly installed.',
    meaning: 'The carriage board electrical pins are unable to form an electrical circuit with the gold contacts on the printhead cartridge chip.',
    causes: [
      'Dirty or oxidized gold contacts on the print cartridge.',
      'Incompatible or expired ink cartridge model.',
      'Cartridge protective yellow tape not fully removed before insertion.',
      'Damaged carriage flexible connector circuit.'
    ],
    solutions: [
      {
        title: 'Clean Cartridge Gold Contact Chips',
        description: 'Use a lint-free cloth and isopropyl alcohol to wipe ink oxidation off the contacts.',
        steps: [
          'Open printer cover and wait for carriage to shift to center.',
          'Remove both black and color cartridges.',
          'Gently wipe gold contact pads on cartridge and carriage pins.',
          'Re-insert cartridges firmly until they click into place.'
        ]
      }
    ],
    technicalExplanation: 'The printer ASIC polls the EEPROM chip embedded in the Canon FINE printhead. If checksum response returns 0x00 or high resistance across pins, status code E05 / 1401 is triggered.',
    faq: [
      {
        question: 'Can I bypass Canon Error E05?',
        answer: 'Press and hold the Stop/Reset button for 10 seconds to disable ink level detection and bypass non-critical warnings.'
      }
    ],
    categoryId: 'printers',
    brandId: 'canon',
    deviceType: 'Canon PIXMA & MAXIFY',
    language: 'en',
    keywords: ['canon e05', 'canon printer error e05', 'canon 1401 error', 'fine cartridge cannot be recognized'],
    tags: ['Canon', 'PIXMA', 'Ink Cartridge', 'Printer Fix'],
    status: 'published',
    readingTime: '3 min read',
    internalLinks: [
      { title: 'Epson Error E-01', url: '/error/epson-e01', anchorText: 'Epson E-01 Scanner Repair' }
    ],
    createdAt: '2026-07-25T11:20:00.000Z',
    updatedAt: '2026-08-01T15:10:00.000Z',
    viewsCount: 1120
  },
  {
    id: 'art-cisco-cpu-hog',
    errorCode: '%SYS-3-CPUHOG',
    title: 'Cisco IOS Syslog %SYS-3-CPUHOG: Causes & Troubleshooting',
    slug: 'cisco-sys-3-cpuhog',
    metaTitle: 'Fix Cisco IOS %SYS-3-CPUHOG Error Message - Network Guide',
    metaDescription: 'Comprehensive network engineering guide for Cisco %SYS-3-CPUHOG error message. Learn process debugging, SNMP polling spikes, and memory dump analysis.',
    shortDefinition: 'Cisco IOS %SYS-3-CPUHOG syslog message indicates that a system process held the CPU without relinquishing control for longer than 2000ms.',
    meaning: 'Cisco IOS runs a cooperative multitasking scheduler. If a process (such as IP Input, BGP Router, or SNMP Engine) hogs execution time past CPUHOG threshold, syslog generates %SYS-3-CPUHOG.',
    causes: [
      'High rate of ARP broadcast storms or IP packet switching in CPU path (CEF disabled).',
      'Aggressive SNMP polling or excessive SSH/Telnet terminal sessions.',
      'Spanning Tree Protocol (STP) topology recalculation loops.',
      'Software defect (IOS bug) in routing protocol calculations.'
    ],
    solutions: [
      {
        title: 'Check CPU Utilization & Active Hogged Process',
        description: 'Execute Cisco IOS commands to inspect hogged processes:',
        codeSnippet: `Router# show processes cpu sorted | exclude 0.00
Router# show processes cpu history
Router# show ip traffic`
      },
      {
        title: 'Verify Cisco Express Forwarding (CEF)',
        description: 'Ensure hardware switching is active so CPU does not handle packet forwarding:',
        codeSnippet: `Router(config)# ip cef`
      }
    ],
    technicalExplanation: 'The IOS scheduler watchdog timer triggers a priority-3 alert when a process hog flag remains set for >2000 milliseconds. If hogging persists over 5000ms, watchdog reset may reload the chassis.',
    faq: [
      {
        question: 'Will %SYS-3-CPUHOG crash my Cisco router?',
        answer: 'Not immediately, but prolonged CPU hogging will drop control plane packets (BGP/OSPF keepalives) causing routing neighbor flaps.'
      }
    ],
    categoryId: 'networking',
    brandId: 'cisco',
    deviceType: 'Cisco Catalyst Switch & ISR Router',
    language: 'en',
    keywords: ['sys-3-cpuhog', 'cisco cpu hog', 'cisco ios error', 'show processes cpu'],
    tags: ['Cisco', 'IOS', 'Networking', 'Router', 'Syslog'],
    status: 'published',
    readingTime: '5 min read',
    internalLinks: [
      { title: 'Mikrotik Action Timed Out', url: '/error/mikrotik-action-timed-out', anchorText: 'Mikrotik RouterOS Error' }
    ],
    createdAt: '2026-07-28T16:00:00.000Z',
    updatedAt: '2026-08-01T18:00:00.000Z',
    viewsCount: 760
  },
  {
    id: 'art-mysql-1045',
    errorCode: '1045',
    title: 'MySQL Error 1045 (28000): Access Denied for User',
    slug: 'mysql-1045',
    metaTitle: 'How to Fix MySQL Error 1045 (28000) Access Denied for User',
    metaDescription: 'Fix MySQL Error 1045 Access Denied for user root@localhost. Learn root password reset commands, privilege grants, and host binding rules.',
    shortDefinition: 'MySQL Error 1045 (SQLSTATE 28000) is an authentication error that occurs when client login credentials (username, password, host match) are invalid.',
    meaning: 'The MySQL/MariaDB server rejected a client connection attempt because the provided password does not match the authentication_string hash stored in mysql.user for the specified user and host pair.',
    causes: [
      'Incorrect password entered for root or database user.',
      'Host mismatch (e.g., user is granted for localhost, but client connects via 127.0.0.1 or remote IP).',
      'Database user privileges not flushed after creation (FLUSH PRIVILEGES).',
      'Plugin mismatch (using mysql_native_password vs caching_sha2_password).'
    ],
    solutions: [
      {
        title: 'Reset MySQL Root Password via Safe Mode',
        description: 'Stop MySQL daemon and restart with --skip-grant-tables to reset password:',
        codeSnippet: `# Stop MySQL service
sudo systemctl stop mysql

# Start with skip grant tables
sudo mysqld_safe --skip-grant-tables &

# Connect and update password
mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'NewSecurePassword123!';
FLUSH PRIVILEGES;`
      }
    ],
    technicalExplanation: 'During handshake phase, MySQL validates client username, host IP, and SHA256 password response. If authorization fails in mysql.user table lookup, server returns ER_ACCESS_DENIED_ERROR (1045).',
    faq: [
      {
        question: 'Why does root@localhost fail when localhost vs 127.0.0.1 is used?',
        answer: 'In MySQL, localhost uses Unix domain sockets, whereas 127.0.0.1 uses TCP/IP network loopback. They are treated as separate user accounts!'
      }
    ],
    categoryId: 'database',
    brandId: 'mysql',
    deviceType: 'MySQL 8.0 / MariaDB Server',
    language: 'en',
    keywords: ['mysql 1045', 'error 1045 28000', 'mysql access denied', 'reset mysql root password'],
    tags: ['MySQL', 'Database', 'SQL', 'Security', 'Authentication'],
    status: 'published',
    readingTime: '4 min read',
    internalLinks: [
      { title: 'PostgreSQL Relation Does Not Exist 42P01', url: '/error/postgresql-42p01', anchorText: 'PostgreSQL 42P01 Error' }
    ],
    createdAt: '2026-07-29T10:00:00.000Z',
    updatedAt: '2026-08-01T12:00:00.000Z',
    viewsCount: 1540
  },
  {
    id: 'art-apple-4013',
    errorCode: '4013',
    title: 'iPhone Error 4013 (iTunes / Finder Restore Error) Fix',
    slug: 'iphone-4013',
    metaTitle: 'How to Fix iPhone Error 4013 (Restore & Update Error) - 100% Solved',
    metaDescription: 'Complete repair guide for iPhone Error 4013. Learn how to fix USB connection drops, NAND memory glitches, and DFU mode restore issues.',
    shortDefinition: 'iPhone Error 4013 is an iTunes/Finder communication fault during an iOS update or restore operation, usually linked to faulty USB cables or hardware sensors.',
    meaning: 'Error 4013 occurs when Apple Mobile Device Service loses connection with the device during firmware flash writing to the NAND storage chip.',
    causes: [
      'Defective USB Lightning or USB-C data transfer cable.',
      'Corrupted iTunes or Apple Devices application installation.',
      'Faulty earpiece flex cable or flood illuminator sensor causing short circuit.',
      'Failing NAND flash memory chip on iPhone logic board.'
    ],
    solutions: [
      {
        title: 'Use Original Apple MFi Cable and Different USB Port',
        description: 'Disconnect third-party hubs and plug iPhone directly into a motherboard USB port.'
      },
      {
        title: 'Force Restart iPhone into DFU / Recovery Mode',
        description: 'For iPhone 8, X, 11, 12, 13, 14, 15, 16:',
        steps: [
          'Press and quickly release Volume Up.',
          'Press and quickly release Volume Down.',
          'Press and hold Side Power Button until recovery screen appears.',
          'Click "Update" in Finder/iTunes to reinstall iOS without erasing data.'
        ]
      }
    ],
    technicalExplanation: 'The iOS restore process uses USB pipe commands. If USB handshake timeout exceeds 15000ms while writing baseband or kernel images, AMRestore performRestoreWithError returns Error 4013.',
    faq: [
      {
        question: 'Does Error 4013 mean my iPhone is dead?',
        answer: 'Not necessarily! In many cases, disconnecting the top sensor flex cable allows the phone to restore successfully without hardware replacement.'
      }
    ],
    categoryId: 'iphone',
    brandId: 'apple',
    deviceType: 'iPhone 11, 12, 13, 14, 15, 16',
    language: 'en',
    keywords: ['iphone error 4013', 'error 4013 itunes', 'iphone restore error 4013', 'fix error 4013'],
    tags: ['iPhone', 'iOS', 'iTunes', 'DFU Mode', 'Apple Repair'],
    status: 'published',
    readingTime: '4 min read',
    internalLinks: [
      { title: 'iPhone Error 3194', url: '/error/iphone-3194', anchorText: 'Fix iPhone Error 3194' }
    ],
    createdAt: '2026-07-30T09:00:00.000Z',
    updatedAt: '2026-08-01T17:30:00.000Z',
    viewsCount: 2400
  },
  {
    id: 'art-hp-error-79',
    errorCode: 'Error 79',
    title: 'HP LaserJet Error 79: Service Error Fix',
    slug: 'hp-error-79',
    metaTitle: 'How to Fix HP LaserJet Error 79 (Turn Off Then On)',
    metaDescription: 'Step-by-step fix for HP LaserJet Error 79. Clear print queue corruption, update firmware, and fix network card errors on HP printers.',
    shortDefinition: 'HP Error 79 is a fatal internal firmware execution error on HP LaserJet printers that forces the machine to halt operations.',
    meaning: 'The printer embedded JetDirect controller experienced a corrupted print job stream, invalid PostScript command, or memory memory heap overflow.',
    causes: [
      'Corrupted print job stuck in Windows or Mac spooler queue.',
      'Outdated printer firmware containing known spooler bug.',
      'Faulty DIMM memory module or corrupt JetDirect EIO card.'
    ],
    solutions: [
      {
        title: 'Clear Computer Print Queue and Power Cycle',
        description: 'Disconnect ethernet network cable, cancel pending documents in Windows Services, then reboot printer.'
      }
    ],
    technicalExplanation: 'Firmware exception handling catches unhandled NULL pointer dereference in JetDirect IP stack, halting execution and printing "79 Service Error".',
    faq: [
      {
        question: 'Why does Error 79 recur every time I reconnect network cable?',
        answer: 'A corrupted or malicious print job is sitting on a networked computer spooler and sending bad packets to the printer IP address.'
      }
    ],
    categoryId: 'printers',
    brandId: 'hp',
    deviceType: 'HP LaserJet Pro & Enterprise',
    language: 'en',
    keywords: ['hp error 79', '79 service error hp', 'hp laserjet 79 error', 'hp printer error code 79'],
    tags: ['HP', 'LaserJet', 'Printer Firmware', 'Service Error'],
    status: 'published',
    readingTime: '3 min read',
    internalLinks: [
      { title: 'Epson Error E-01', url: '/error/epson-e01', anchorText: 'Epson E-01 Guide' }
    ],
    createdAt: '2026-07-27T14:00:00.000Z',
    updatedAt: '2026-08-01T10:15:00.000Z',
    viewsCount: 980
  }
];
