import { render, screen } from '@testing-library/react';
import DashboardStats from '../DashboardStats';
import { DEFAULT_WIDGETS, DEFAULT_LAYOUT } from '../../utils/dashboard';
import type { Delivery } from '../../types/delivery';

const mockDeliveries: Delivery[] = [
  { id: 'DEL001', name: 'テスト太郎', address: '東京都渋谷区1-1-1', status: 'pending',    deliveryDate: '2025-01-01' },
  { id: 'DEL002', name: 'テスト次郎', address: '東京都新宿区2-2-2', status: 'in_transit', deliveryDate: '2025-01-02' },
  { id: 'DEL003', name: 'テスト三郎', address: '東京都品川区3-3-3', status: 'completed',  deliveryDate: '2025-01-03' },
];

describe('DashboardStats', () => {
  it('ウィジェットのラベルが表示されること', () => {
    render(
      <DashboardStats
        deliveries={mockDeliveries}
        widgets={DEFAULT_WIDGETS}
        layout={DEFAULT_LAYOUT}
      />
    );
    expect(screen.getByText('総配送件数')).toBeInTheDocument();
    expect(screen.getByText('配送待ち')).toBeInTheDocument();
    expect(screen.getByText('配送中')).toBeInTheDocument();
    expect(screen.getByText('完了')).toBeInTheDocument();
  });

  it('総件数が正しく表示されること', () => {
    render(
      <DashboardStats
        deliveries={mockDeliveries}
        widgets={DEFAULT_WIDGETS}
        layout={DEFAULT_LAYOUT}
      />
    );
    // 総配送件数 = 3
    const threes = screen.getAllByText('3');
    expect(threes.length).toBeGreaterThan(0);
  });

  it('配送データが空の場合にゼロが表示されること', () => {
    render(
      <DashboardStats
        deliveries={[]}
        widgets={DEFAULT_WIDGETS}
        layout={DEFAULT_LAYOUT}
      />
    );
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThan(0);
  });

  it('全ウィジェット非表示の場合にメッセージが表示されること', () => {
    const allDisabled = DEFAULT_WIDGETS.map(w => ({ ...w, enabled: false }));
    render(
      <DashboardStats
        deliveries={mockDeliveries}
        widgets={allDisabled}
        layout={DEFAULT_LAYOUT}
      />
    );
    expect(screen.getByText(/ウィジェットが非表示/)).toBeInTheDocument();
  });

  it('有効なウィジェットのみ表示されること', () => {
    const partialWidgets = DEFAULT_WIDGETS.map((w, i) => ({ ...w, enabled: i === 0 }));
    render(
      <DashboardStats
        deliveries={mockDeliveries}
        widgets={partialWidgets}
        layout={DEFAULT_LAYOUT}
      />
    );
    expect(screen.getByText('総配送件数')).toBeInTheDocument();
    expect(screen.queryByText('配送待ち')).not.toBeInTheDocument();
  });
});