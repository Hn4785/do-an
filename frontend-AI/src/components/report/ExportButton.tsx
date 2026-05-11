import { useState } from 'react';
import { Download, FileText, Table } from 'lucide-react';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';

// ✅ Fix: import named functions thay vì object namespace
import {
  exportSessionReportPDF,
  exportTimelineCSV,
} from '@/utils/exportUtils';
import type { SessionReport } from '@/types/report.types';

interface ExportButtonProps {
  report: SessionReport;
  className?: string;
}

export default function ExportButton({ report, className }: ExportButtonProps) {
  const [isOpen,    setIsOpen]    = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'csv' | null>(null);

  const handleExport = async (format: 'pdf' | 'csv') => {
    setExporting(format);
    try {
      if (format === 'pdf') {
        // ✅ Fix: gọi trực tiếp named function
        exportSessionReportPDF(report);
      } else {
        // ✅ Fix: gọi trực tiếp named function
        exportTimelineCSV(report);
      }
    } finally {
      setExporting(null);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        leftIcon={<Download size={15} />}
        onClick={() => setIsOpen(true)}
        className={className}
      >
        Xuất báo cáo
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Xuất báo cáo"
        size="sm"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-400">Chọn định dạng xuất:</p>

          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting !== null}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-700 hover:border-indigo-500 hover:bg-indigo-950/30 transition-colors disabled:opacity-50"
          >
            <FileText size={20} className="text-red-400 shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-100">PDF</p>
              <p className="text-xs text-gray-400">Báo cáo đầy đủ với biểu đồ</p>
            </div>
            {exporting === 'pdf' && (
              <span className="ml-auto text-xs text-indigo-400 animate-pulse">Đang xuất...</span>
            )}
          </button>

          <button
            onClick={() => handleExport('csv')}
            disabled={exporting !== null}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-700 hover:border-indigo-500 hover:bg-indigo-950/30 transition-colors disabled:opacity-50"
          >
            <Table size={20} className="text-green-400 shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-100">CSV</p>
              <p className="text-xs text-gray-400">Dữ liệu thô dạng bảng tính</p>
            </div>
            {exporting === 'csv' && (
              <span className="ml-auto text-xs text-indigo-400 animate-pulse">Đang xuất...</span>
            )}
          </button>
        </div>
      </Modal>
    </>
  );
}
