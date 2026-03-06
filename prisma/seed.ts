import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─────────────────────────────────────────
// デモデータ投入（APIからも呼び出し可能）
// ─────────────────────────────────────────

export async function seedDemoData() {
  // ── 既存データをクリア（外部キー順に削除） ──
  await prisma.auditLog.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.location.deleteMany();

  // ── 拠点 ──
  const locations = await Promise.all([
    prisma.location.create({
      data: {
        name: '本院（新宿クリニック）',
        address: '東京都新宿区西新宿1-1-1',
        phone: '03-1234-5678',
        isActive: true,
      },
    }),
    prisma.location.create({
      data: {
        name: '分院（渋谷クリニック）',
        address: '東京都渋谷区道玄坂2-2-2',
        phone: '03-2345-6789',
        isActive: true,
      },
    }),
    prisma.location.create({
      data: {
        name: '調剤センター（池袋）',
        address: '東京都豊島区池袋3-3-3',
        phone: '03-3456-7890',
        isActive: true,
      },
    }),
  ]);

  // ── 担当者 ──
  const staff = await Promise.all([
    prisma.staff.create({
      data: {
        name: '田中 健太',
        email: 'tanaka@clinic.com',
        phone: '090-1111-2222',
        department: '配送部',
        isActive: true,
      },
    }),
    prisma.staff.create({
      data: {
        name: '佐藤 美咲',
        email: 'sato@clinic.com',
        phone: '090-2222-3333',
        department: '配送部',
        isActive: true,
      },
    }),
    prisma.staff.create({
      data: {
        name: '鈴木 大輔',
        email: 'suzuki@clinic.com',
        phone: '090-3333-4444',
        department: '薬剤部',
        isActive: true,
      },
    }),
    prisma.staff.create({
      data: {
        name: '高橋 花子',
        email: 'takahashi@clinic.com',
        phone: '090-4444-5555',
        department: '薬剤部',
        isActive: true,
      },
    }),
    prisma.staff.create({
      data: {
        name: '伊藤 誠',
        email: 'ito@clinic.com',
        phone: '090-5555-6666',
        department: '配送部',
        isActive: true,
      },
    }),
  ]);

  // ── 顧客 ──
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: '山田 太郎',
        address: '東京都世田谷区太子堂1-1-1',
        phone: '03-1111-1111',
        note: '毎週水曜配送',
        isActive: true,
      },
    }),
    prisma.customer.create({
      data: {
        name: '中村 次郎',
        address: '東京都杉並区阿佐谷2-2-2',
        phone: '03-2222-2222',
        note: '在宅療養中・日中不在あり',
        isActive: true,
      },
    }),
    prisma.customer.create({
      data: {
        name: '小林 三郎',
        address: '東京都練馬区石神井3-3-3',
        phone: '03-3333-3333',
        note: '冷蔵保管必要',
        isActive: true,
      },
    }),
    prisma.customer.create({
      data: {
        name: '加藤 四郎',
        address: '東京都板橋区志村4-4-4',
        phone: '03-4444-4444',
        note: '午前中のみ受取可',
        isActive: true,
      },
    }),
    prisma.customer.create({
      data: {
        name: '吉田 五郎',
        address: '東京都北区赤羽5-5-5',
        phone: '03-5555-5555',
        isActive: true,
      },
    }),
    prisma.customer.create({
      data: {
        name: '渡辺 六子',
        address: '東京都足立区竹ノ塚6-6-6',
        phone: '03-6666-6666',
        note: '高齢・インターフォン必須',
        isActive: true,
      },
    }),
    prisma.customer.create({
      data: {
        name: '松本 七恵',
        address: '東京都葛飾区亀有7-7-7',
        phone: '03-7777-7777',
        isActive: true,
      },
    }),
    prisma.customer.create({
      data: {
        name: '井上 八重',
        address: '東京都江戸川区小岩8-8-8',
        phone: '03-8888-8888',
        note: 'ペットあり・チャイム2回',
        isActive: true,
      },
    }),
  ]);

  // ── 配送データ（今日基準でリアルな日付生成）──
  const today = new Date();

  const dateStr = (offset: number): string => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
  };

  const deliveriesData = [
    // ── 本日配送 ──
    {
      name: '処方薬 山田様',
      address: customers[0].address,
      status: 'in_transit',
      deliveryDate: dateStr(0),
      staffId: staff[0].id,
      customerId: customers[0].id,
      locationId: locations[0].id,
    },
    {
      name: '処方薬 中村様',
      address: customers[1].address,
      status: 'pending',
      deliveryDate: dateStr(0),
      staffId: staff[1].id,
      customerId: customers[1].id,
      locationId: locations[0].id,
    },
    {
      name: '医療用品 小林様',
      address: customers[2].address,
      status: 'completed',
      deliveryDate: dateStr(0),
      staffId: staff[0].id,
      customerId: customers[2].id,
      locationId: locations[1].id,
    },
    // ── 明日 ──
    {
      name: '処方薬 加藤様',
      address: customers[3].address,
      status: 'pending',
      deliveryDate: dateStr(1),
      staffId: staff[2].id,
      customerId: customers[3].id,
      locationId: locations[0].id,
    },
    {
      name: '処方薬 吉田様',
      address: customers[4].address,
      status: 'pending',
      deliveryDate: dateStr(1),
      staffId: staff[1].id,
      customerId: customers[4].id,
      locationId: locations[2].id,
    },
    // ── 明後日 ──
    {
      name: '定期配送 渡辺様',
      address: customers[5].address,
      status: 'pending',
      deliveryDate: dateStr(2),
      staffId: staff[3].id,
      customerId: customers[5].id,
      locationId: locations[1].id,
    },
    {
      name: '処方薬 松本様',
      address: customers[6].address,
      status: 'pending',
      deliveryDate: dateStr(2),
      staffId: staff[4].id,
      customerId: customers[6].id,
      locationId: locations[0].id,
    },
    // ── 今週 ──
    {
      name: '医療用品 井上様',
      address: customers[7].address,
      status: 'pending',
      deliveryDate: dateStr(3),
      staffId: staff[0].id,
      customerId: customers[7].id,
      locationId: locations[2].id,
    },
    {
      name: '処方薬 山田様（週次）',
      address: customers[0].address,
      status: 'pending',
      deliveryDate: dateStr(4),
      staffId: staff[1].id,
      customerId: customers[0].id,
      locationId: locations[0].id,
    },
    {
      name: '処方薬 中村様（週次）',
      address: customers[1].address,
      status: 'pending',
      deliveryDate: dateStr(5),
      staffId: staff[2].id,
      customerId: customers[1].id,
      locationId: locations[0].id,
    },
    // ── 過去（完了済み）──
    {
      name: '処方薬 小林様',
      address: customers[2].address,
      status: 'completed',
      deliveryDate: dateStr(-1),
      staffId: staff[0].id,
      customerId: customers[2].id,
      locationId: locations[1].id,
    },
    {
      name: '医療用品 加藤様',
      address: customers[3].address,
      status: 'completed',
      deliveryDate: dateStr(-2),
      staffId: staff[3].id,
      customerId: customers[3].id,
      locationId: locations[0].id,
    },
    {
      name: '処方薬 吉田様',
      address: customers[4].address,
      status: 'completed',
      deliveryDate: dateStr(-3),
      staffId: staff[4].id,
      customerId: customers[4].id,
      locationId: locations[2].id,
    },
    // ── 期限切れ（overdue テスト用）──
    {
      name: '未配送 渡辺様【要確認】',
      address: customers[5].address,
      status: 'pending',
      deliveryDate: dateStr(-5),
      staffId: staff[1].id,
      customerId: customers[5].id,
      locationId: locations[1].id,
    },
    {
      name: '未配送 松本様【要確認】',
      address: customers[6].address,
      status: 'pending',
      deliveryDate: dateStr(-7),
      staffId: staff[2].id,
      customerId: customers[6].id,
      locationId: locations[0].id,
    },
  ];

  for (const data of deliveriesData) {
    await prisma.delivery.create({ data });
  }

  console.log('✅ シードデータ投入完了');
  console.log(`   拠点:   ${locations.length} 件`);
  console.log(`   担当者: ${staff.length} 件`);
  console.log(`   顧客:   ${customers.length} 件`);
  console.log(`   配送:   ${deliveriesData.length} 件`);
}

// ─────────────────────────────────────────
// 直接実行用エントリーポイント
// npx prisma db seed で呼ばれる
// ─────────────────────────────────────────

async function main() {
  console.log('🌱 シードデータを投入中...');
  await seedDemoData();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());