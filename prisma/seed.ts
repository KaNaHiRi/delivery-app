import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.delivery.deleteMany();

  const deliveries = [
    { name: '田中 太郎', address: '東京都渋谷区1-1-1', status: 'pending', deliveryDate: '2026-03-01' },
    { name: '鈴木 花子', address: '大阪府大阪市北区2-2-2', status: 'in_transit', deliveryDate: '2026-02-28' },
    { name: '佐藤 次郎', address: '愛知県名古屋市中区3-3-3', status: 'completed', deliveryDate: '2026-02-27' },
  ];

  for (const d of deliveries) {
    await prisma.delivery.create({ data: d });
  }

  console.log(`✅ Seeded ${deliveries.length} deliveries`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());