import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  FileBarChart2,
  History,
  Settings,
  Brain,
  Bell,
} from 'lucide-react';
import { useAlertStore } from '@/store/useAlertStore';
import { useSessionStore } from '@/store/useSessionStore';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: '/',         label: 'Dashboard', icon: <LayoutDashboard size={20} />, end: true },
  { to: '/report',   label: 'Báo cáo',   icon: <FileBarChart2 size={20} /> },
  { to: '/history',  label: 'Lịch sử',   icon: <History size={20} /> },
  { to: '/settings', label: 'Cài đặt',   icon: <Settings size={20} /> },
];

export default function Sidebar() {
  const unreadCount = useAlertStore((s) => s.unreadCount);

  // ✅ Fix: đọc từ current.status thay vì isActive
  const isActive = useSessionStore((s) => s.current?.status === 'running');

  return (
    <aside className="flex flex-col w-16 lg:w-56 h-screen bg-gray-950 border-r border-gray-800 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 shrink-0">
          <Brain size={18} className="text-white" />
        </div>
        <span className="hidden lg:block text-sm font-bold text-gray-100 truncate">
          Face Monitor
        </span>
      </div>

      {/* Session indicator */}
      {isActive && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-green-950/50 border border-green-800/50 hidden lg:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
          <span className="text-xs text-green-400 font-medium">Đang ghi nhận</span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive: active }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                'text-sm font-medium',
                active
                  ? 'bg-indigo-600/20 text-indigo-400'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
              )
            }
          >
            <span className="shrink-0">{item.icon}</span>
            <span className="hidden lg:block">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Alert badge */}
      {unreadCount > 0 && (
        <div className="px-3 pb-4">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-red-950/40 border border-red-800/40">
            <div className="relative shrink-0">
              <Bell size={18} className="text-red-400" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
            <span className="hidden lg:block text-xs text-red-300 font-medium">
              {unreadCount} cảnh báo mới
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
