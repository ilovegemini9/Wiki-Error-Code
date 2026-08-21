import { AdminSidebar } from '@/components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row text-gray-900 font-sans">
      <AdminSidebar />
      <main className="flex-1 bg-white p-4 sm:p-8 overflow-x-auto min-w-0">
        {children}
      </main>
    </div>
  );
}
