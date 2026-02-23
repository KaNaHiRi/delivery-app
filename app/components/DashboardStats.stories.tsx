import type { Meta, StoryObj } from '@storybook/react';
import DashboardStats from './DashboardStats';
import type { Delivery } from '../types/delivery';

const meta: Meta<typeof DashboardStats> = {
  title: 'Components/DashboardStats',
  component: DashboardStats,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

const sampleDeliveries: Delivery[] = [
  { id: '1', name: '山田 太郎', address: '東京都新宿区1-1', status: 'pending', deliveryDate: today },
  { id: '2', name: '佐藤 花子', address: '東京都渋谷区2-2', status: 'in_transit', deliveryDate: today },
  { id: '3', name: '鈴木 一郎', address: '大阪府大阪市3-3', status: 'completed', deliveryDate: yesterday },
  { id: '4', name: '田中 二郎', address: '愛知県名古屋市4-4', status: 'pending', deliveryDate: tomorrow },
  { id: '5', name: '伊藤 三郎', address: '福岡県福岡市5-5', status: 'completed', deliveryDate: yesterday },
];

export const Default: Story = {
  args: { deliveries: sampleDeliveries },
};

export const Empty: Story = {
  args: { deliveries: [] },
};

export const AllCompleted: Story = {
  args: {
    deliveries: sampleDeliveries.map(d => ({ ...d, status: 'completed' as const })),
  },
};

export const LargeDataset: Story = {
  args: {
    deliveries: Array.from({ length: 200 }, (_, i) => ({
      id: String(i + 1),
      name: `テストユーザー ${i + 1}`,
      address: `東京都テスト区${i + 1}-${i + 1}`,
      status: (['pending', 'in_transit', 'completed'] as const)[i % 3],
      deliveryDate: today,
    })),
  },
};