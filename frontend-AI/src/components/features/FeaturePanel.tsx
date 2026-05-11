import { useState } from 'react';
import { clsx } from 'clsx';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Card from '@/components/common/Card';
import EARDisplay from './EARDisplay';
import MARDisplay from './MARDisplay';
import BrowIndicator from './BrowIndicator';
import MouthIndicator from './MouthIndicator';
import BlinkCounter from './BlinkCounter';
import StressGauge from './StressGauge';
import FusionVectorDisplay from './FusionVectorDisplay';
import { useFeatureStore } from '@/store/useFeatureStore';

type TabId = 'overview' | 'eye' | 'mouth' | 'stress' | 'fusion';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: 'overview', label: 'Tổng quan', icon: '📊' },
  { id: 'eye',      label: 'Mắt',       icon: '👁️' },
  { id: 'mouth',    label: 'Miệng',     icon: '👄' },
  { id: 'stress',   label: 'Stress',    icon: '😤' },
  { id: 'fusion',   label: 'Fusion',    icon: '🔬' },
];

interface FeaturePanelProps {
  className?: string;
  defaultTab?: TabId;
  collapsible?: boolean;
}

export default function FeaturePanel({
  className,
  defaultTab = 'overview',
  collapsible = false,
}: FeaturePanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>(defaultTab);
  const [collapsed, setCollapsed] = useState(false);
  const faceDetected = useFeatureStore((s) => s.faceDetected);

  return (
    <Card
      className={clsx('overflow-hidden', className)}
      noPadding
      title={
        collapsible ? undefined : 'Đặc Trưng Khuôn Mặt'
      }
      headerRight={
        collapsible ? (
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-1 rounded text-gray-400 hover:text-gray-100"
          >
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        ) : undefined
      }
    >
      {/* Header khi collapsible */}
      {collapsible && (
        <div
          className="flex items-center justify-between px-4 py-3 border-b border-gray-800 cursor-pointer"
          onClick={() => setCollapsed((c) => !c)}
        >
          <span className="text-sm font-semibold text-gray-100">Đặc Trưng Khuôn Mặt</span>
          <div className="flex items-center gap-2">
            {!faceDetected && (
              <span className="text-[10px] text-yellow-400 bg-yellow-950/50 px-2 py-0.5 rounded-full">
                Không có khuôn mặt
              </span>
            )}
            {collapsed ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronUp size={16} className="text-gray-400" />}
          </div>
        </div>
      )}

      {!collapsed && (
        <>
          {/* Tabs */}
          <div className="flex border-b border-gray-800 overflow-x-auto scrollbar-none">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap',
                  'border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                )}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-2 gap-4">
                <BlinkCounter compact />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Stress</span>
                  <span className="text-sm font-mono font-bold text-orange-400">
                    {/* Lấy từ useStressLevel */}
                  </span>
                </div>
                <EARDisplay compact />
                <MARDisplay compact />
                <BrowIndicator />
                <MouthIndicator />
              </div>
            )}

            {/* Eye */}
            {activeTab === 'eye' && (
              <div className="space-y-4">
                <EARDisplay />
                <div className="border-t border-gray-800 pt-4">
                  <BlinkCounter />
                </div>
              </div>
            )}

            {/* Mouth */}
            {activeTab === 'mouth' && (
              <div className="space-y-4">
                <MARDisplay />
                <div className="border-t border-gray-800 pt-4">
                  <MouthIndicator />
                </div>
              </div>
            )}

            {/* Stress */}
            {activeTab === 'stress' && (
              <div className="space-y-4">
                <StressGauge />
                <div className="border-t border-gray-800 pt-4">
                  <BrowIndicator />
                </div>
              </div>
            )}

            {/* Fusion */}
            {activeTab === 'fusion' && (
              <FusionVectorDisplay />
            )}
          </div>
        </>
      )}
    </Card>
  );
}
