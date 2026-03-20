import { Loader2 } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12" role="status" aria-label="読み込み中">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" aria-hidden="true" />
      <span className="ml-3 text-gray-600 dark:text-gray-400">データを読み込み中...</span>
    </div>
  );
}