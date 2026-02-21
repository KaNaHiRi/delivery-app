import { useState, useCallback } from 'react';
import { useInterval } from './useInterval';

export interface AutoRefreshConfig {
  interval: number; // ミリ秒
  enabled: boolean;
}

export const REFRESH_INTERVALS = [
  { label: '5秒', value: 5000 },
  { label: '10秒', value: 10000 },
  { label: '30秒', value: 30000 },
  { label: '1分', value: 60000 },
] as const;

/**
 * 自動更新機能フック
 */
export function useAutoRefresh(onRefresh: () => void) {
  const [config, setConfig] = useState<AutoRefreshConfig>({
    interval: 30000,
    enabled: false,
  });
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const handleRefresh = useCallback(() => {
    onRefresh();
    setLastRefreshed(new Date());
  }, [onRefresh]);

  // 有効時のみポーリング。C#: timer.Enabled に相当
  useInterval(handleRefresh, config.enabled ? config.interval : null);

  const toggle = useCallback(() => {
    setConfig(prev => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  const setInterval_ = useCallback((interval: number) => {
    setConfig(prev => ({ ...prev, interval }));
  }, []);

  const manualRefresh = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  return {
    config,
    lastRefreshed,
    toggle,
    setInterval: setInterval_,
    manualRefresh,
  };
}