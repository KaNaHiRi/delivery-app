'use client';

import { useMemo, useState, useEffect, memo } from 'react';
import { Package, Truck, CheckCircle, Calendar } from 'lucide-react';
import { Delivery } from '../types/delivery';
import { usePerformanceMonitor } from '../utils/performance';
import { useTranslations } from 'next-intl';

interface DashboardStatsProps {
  deliveries: Delivery[];
}

const DashboardStats = memo(function DashboardStats({ deliveries }: DashboardStatsProps) {
  usePerformanceMonitor('DashboardStats');
  
  const [isMounted, setIsMounted] = useState(false);
  const t = useTranslations('dashboard');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: deliveries.length,
      inTransit: deliveries.filter((d) => d.status === 'in_transit').length,
      completed: deliveries.filter((d) => d.status === 'completed').length,
      todayDeliveries: deliveries.filter((d) => d.deliveryDate === today).length,
    };
  }, [deliveries]);

  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    { title: t('total'),     value: stats.total,           icon: Package,     color: 'blue' },
    { title: t('inTransit'), value: stats.inTransit,       icon: Truck,       color: 'yellow' },
    { title: t('completed'), value: stats.completed,       icon: CheckCircle, color: 'green' },
    { title: t('todayDeliveries'), value: stats.todayDeliveries, icon: Calendar, color: 'purple' },
  ];

  const colorClasses = {
    blue:   'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300',
    yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300',
    green:  'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((card) => (
        <div
          key={card.title}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{card.title}</p>
              <p className="text-3xl font-bold mt-2">{card.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${colorClasses[card.color as keyof typeof colorClasses]}`}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

export default DashboardStats;