import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 既存データクリア
  await prisma.delivery.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.customer.deleteMany();

  // 担当者サンプル
  const staff1 = await prisma.staff.create({
    data: { name: '田中 太郎', email: 'tanaka@clinic.com', phone: '03-1234-5678', department: '配送部', isActive: true },
  });
  const staff2 = await prisma.staff.create({
    data: { name: '山田 花子', email: 'yamada@clinic.com', phone: '03-9876-5432', department: '配送部', isActive: true },
  });

  // 顧客サンプル
  const customer1 = await prisma.customer.create({
    data: { name: '佐藤 一郎', address: '東京都新宿区西新宿1-1-1', phone: '090-1234-5678', isActive: true },
  });
  const customer2 = await prisma.customer.create({
    data: { name: '鈴木 二郎', address: '東京都渋谷区渋谷2-2-2', phone: '090-9876-5432', isActive: true },
  });

  // 配送データサンプル
  await prisma.delivery.createMany({
    data: [
      { name: '山田 太郎', address: '東京都新宿区1-1-1', status: 'pending', deliveryDate: '2026-03-01', staffId: staff1.id, customerId: customer1.id },
      { name: '鈴木 花子', address: '東京都渋谷区2-2-2', status: 'in_transit', deliveryDate: '2026-03-02', staffId: staff2.id, customerId: customer2.id },
      { name: '田中 一郎', address: '東京都品川区3-3-3', status: 'completed', deliveryDate: '2026-02-28' },
    ],
  });

  console.log('✅ Seed完了');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());