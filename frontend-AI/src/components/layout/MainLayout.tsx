import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/common/Siderbar';
import Header from './Header';
import Footer from './Footer';

interface MainLayoutProps {
  wsConnected?: boolean;
}

export default function MainLayout({ wsConnected = false }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header wsConnected={wsConnected} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
