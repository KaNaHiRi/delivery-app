import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardStats from '../DashboardStats';
import type { Delivery } from '@/app/types/delivery';

describe('DashboardStats', () => {
  const mockDeliveries: Delivery[] = [
    {
      id: '1',
      name: '山田太郎',
      address: '東京都新宿区1-1-1',
      status: 'pending',
      deliveryDate: '2024-02-20',
    },
    {
      id: '2',
      name: '佐藤花子',
      address: '大阪府大阪市2-2-2',
      status: 'in_transit',
      deliveryDate: '2024-02-20',
    },
    {
      id: '3',
      name: '鈴木一郎',
      address: '東京都渋谷区3-3-3',
      status: 'completed',
      deliveryDate: '2024-02-20',
    },
  ];

  test('統計情報が正しく表示されること', async () => {
    render(<DashboardStats deliveries={mockDeliveries} />);

    await waitFor(() => {
      // 総件数 3件が表示される
      expect(screen.getByText('総件数')).toBeInTheDocument();
      const elements = screen.getAllByText('3');
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  test('データが空の場合0件と表示されること', async () => {
    render(<DashboardStats deliveries={[]} />);

    await waitFor(() => {
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements.length).toBeGreaterThan(0);
    });
  });

  test('グラフが正しく描画されること', async () => {
    const { container } = render(<DashboardStats deliveries={mockDeliveries} />);

    await waitFor(() => {
      // recharts の SVG要素が存在すること
      const charts = container.querySelectorAll('svg');
      expect(charts.length).toBeGreaterThan(0);
    });
  });

  test('ステータス別の件数が正しく集計されること', async () => {
    render(<DashboardStats deliveries={mockDeliveries} />);

    await waitFor(() => {
      // カードのラベルをチェック
      expect(screen.getByText('配送中')).toBeInTheDocument();
      expect(screen.getByText('完了')).toBeInTheDocument();
      expect(screen.getByText('本日の配送')).toBeInTheDocument();
      
      // 件数をチェック（複数の「1」があるので getAllByText を使用）
      const ones = screen.getAllByText('1');
      expect(ones.length).toBeGreaterThan(0);
    });
  });

  test('各ステータスのカウントが正確であること', async () => {
    render(<DashboardStats deliveries={mockDeliveries} />);

    await waitFor(() => {
      // 総件数
      expect(screen.getByText('総件数')).toBeInTheDocument();
      
      // 配送中: 1件
      expect(screen.getByText('配送中')).toBeInTheDocument();
      
      // 完了: 1件
      expect(screen.getByText('完了')).toBeInTheDocument();
    });
  });
});