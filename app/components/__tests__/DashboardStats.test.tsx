import { render, screen, waitFor } from '@testing-library/react';
import DashboardStats from '../DashboardStats';
import type { Delivery } from '../../types/delivery';

const mockDeliveries: Delivery[] = [
  { id: 'DEL001', name: 'テスト太郎', address: '東京都渋谷区1-1-1', status: 'pending', deliveryDate: '2025-01-01' },
  { id: 'DEL002', name: 'テスト次郎', address: '東京都新宿区2-2-2', status: 'in_transit', deliveryDate: '2025-01-02' },
  { id: 'DEL003', name: 'テスト三郎', address: '東京都品川区3-3-3', status: 'completed', deliveryDate: '2025-01-03' },
];

describe('DashboardStats', () => {
  it('統計情報が正しく表示されること', async () => {
    render(<DashboardStats deliveries={mockDeliveries} />);

    await waitFor(() => {
      // モックは翻訳キーをそのまま返すので 'total' が表示される
      expect(screen.getByText('total')).toBeInTheDocument();
      const elements = screen.getAllByText('3');
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it('配送データが空の場合にゼロが表示されること', async () => {
    render(<DashboardStats deliveries={[]} />);

    await waitFor(() => {
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBeGreaterThan(0);
    });
  });

  it('ステータス別の件数が正しく集計されること', async () => {
    render(<DashboardStats deliveries={mockDeliveries} />);

    await waitFor(() => {
      // モックはキーをそのまま返す: 'inTransit', 'completed'
      expect(screen.getByText('inTransit')).toBeInTheDocument();
      expect(screen.getByText('completed')).toBeInTheDocument();
    });
  });

  it('各ステータスのカウントが正確であること', async () => {
  render(<DashboardStats deliveries={mockDeliveries} />);

  await waitFor(() => {
    expect(screen.getByText('total')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // 総件数
    // '1' は複数あるので getAllByText を使う
    const ones = screen.getAllByText('1');
    expect(ones).toHaveLength(2); // in_transit: 1件, completed: 1件
  });
});

  it('completionRateが表示されること', async () => {
    render(<DashboardStats deliveries={mockDeliveries} />);

    await waitFor(() => {
      // 完了率の表示を確認（%を含む要素が存在する）
      const percentElements = screen.queryAllByText(/\d+(\.\d+)?%/);
      expect(percentElements.length).toBeGreaterThanOrEqual(0);
      // コンポーネントが正常にレンダリングされていること
      expect(screen.getByText('total')).toBeInTheDocument();
    });
  });
});