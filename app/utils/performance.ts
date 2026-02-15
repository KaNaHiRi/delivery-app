// パフォーマンス計測ユーティリティ

export interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private enabled = process.env.NODE_ENV === 'development';

  startMeasure(componentName: string): () => void {
    if (!this.enabled) return () => {};
    
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      this.metrics.push({
        componentName,
        renderTime,
        timestamp: Date.now(),
      });

      if (renderTime > 16) { // 60fps = 16.67ms/frame
        console.warn(
          `⚠️ Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`
        );
      }
    };
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getAverageRenderTime(componentName: string): number {
    const componentMetrics = this.metrics.filter(
      (m) => m.componentName === componentName
    );
    
    if (componentMetrics.length === 0) return 0;
    
    const total = componentMetrics.reduce((sum, m) => sum + m.renderTime, 0);
    return total / componentMetrics.length;
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  logSummary(): void {
    if (!this.enabled) return;
    
    const componentNames = Array.from(
      new Set(this.metrics.map((m) => m.componentName))
    );
    
    console.group('📊 Performance Summary');
    componentNames.forEach((name) => {
      const avg = this.getAverageRenderTime(name);
      const count = this.metrics.filter((m) => m.componentName === name).length;
      console.log(`${name}: ${avg.toFixed(2)}ms (${count} renders)`);
    });
    console.groupEnd();
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Reactコンポーネント用のフック
export function usePerformanceMonitor(componentName: string): void {
  if (process.env.NODE_ENV === 'development') {
    const endMeasure = performanceMonitor.startMeasure(componentName);
    // レンダリング完了時に計測終了
    setTimeout(endMeasure, 0);
  }
}