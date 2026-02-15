// app/components/DateRangePicker.tsx
'use client';

import React from 'react';
import { Calendar } from 'lucide-react';

interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateRangePickerProps {
  dateRange: DateRange;
  onChange: (range: DateRange) => void;
  minDate?: string;
  maxDate?: string;
}

export default function DateRangePicker({
  dateRange,
  onChange,
  minDate,
  maxDate = new Date().toISOString().split('T')[0],
}: DateRangePickerProps) {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    
    // 開始日が終了日より後の場合、終了日も同じ日に設定
    if (newStartDate > dateRange.endDate) {
      onChange({ startDate: newStartDate, endDate: newStartDate });
    } else {
      onChange({ ...dateRange, startDate: newStartDate });
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    
    // 終了日が開始日より前の場合、開始日も同じ日に設定
    if (newEndDate < dateRange.startDate) {
      onChange({ startDate: newEndDate, endDate: newEndDate });
    } else {
      onChange({ ...dateRange, endDate: newEndDate });
    }
  };

  // 日付の差分を計算（表示用）
  const getDaysDifference = () => {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // 開始日も含めるので+1
  };

  return (
    <div className="space-y-4">
      {/* 開始日 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Calendar className="inline w-4 h-4 mr-1" />
          開始日
        </label>
        <input
          type="date"
          value={dateRange.startDate}
          onChange={handleStartDateChange}
          min={minDate}
          max={maxDate}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400
                   focus:border-transparent"
        />
      </div>

      {/* 終了日 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Calendar className="inline w-4 h-4 mr-1" />
          終了日
        </label>
        <input
          type="date"
          value={dateRange.endDate}
          onChange={handleEndDateChange}
          min={minDate}
          max={maxDate}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400
                   focus:border-transparent"
        />
      </div>

      {/* 期間表示 */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 
                    rounded-lg p-3 text-sm">
        <p className="text-indigo-700 dark:text-indigo-300">
          📅 選択期間: <span className="font-semibold">{getDaysDifference()}日間</span>
        </p>
        <p className="text-indigo-600 dark:text-indigo-400 text-xs mt-1">
          {dateRange.startDate} 〜 {dateRange.endDate}
        </p>
      </div>
    </div>
  );
}