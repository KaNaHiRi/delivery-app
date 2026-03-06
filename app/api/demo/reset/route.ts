import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
  }

  try {
    const today = new Date();
    const dateStr = (offset: number): string => {
      const d = new Date(today);
      d.setDate(d.getDate() + offset);
      return d.toISOString().split('T')[0];
    };

    // ── クリア ──
    await prisma.auditLog.deleteMany();
    await prisma.delivery.deleteMany();
    await prisma.staff.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.location.deleteMany();

    // ── 拠点 ──
    const loc0 = await prisma.location.create({ data: { name: '本院（新宿クリニック）', address: '東京都新宿区西新宿1-1-1', phone: '03-1234-5678', isActive: true } });
    const loc1 = await prisma.location.create({ data: { name: '分院（渋谷クリニック）', address: '東京都渋谷区道玄坂2-2-2', phone: '03-2345-6789', isActive: true } });
    const loc2 = await prisma.location.create({ data: { name: '調剤センター（池袋）', address: '東京都豊島区池袋3-3-3', phone: '03-3456-7890', isActive: true } });

    // ── 担当者 ──
    const st0 = await prisma.staff.create({ data: { name: '田中 健太', email: 'tanaka@clinic.com', phone: '090-1111-2222', department: '配送部', isActive: true } });
    const st1 = await prisma.staff.create({ data: { name: '佐藤 美咲', email: 'sato@clinic.com', phone: '090-2222-3333', department: '配送部', isActive: true } });
    const st2 = await prisma.staff.create({ data: { name: '鈴木 大輔', email: 'suzuki@clinic.com', phone: '090-3333-4444', department: '薬剤部', isActive: true } });
    const st3 = await prisma.staff.create({ data: { name: '高橋 花子', email: 'takahashi@clinic.com', phone: '090-4444-5555', department: '薬剤部', isActive: true } });
    const st4 = await prisma.staff.create({ data: { name: '伊藤 誠', email: 'ito@clinic.com', phone: '090-5555-6666', department: '配送部', isActive: true } });

    // ── 顧客 ──
    const cu0 = await prisma.customer.create({ data: { name: '山田 太郎', address: '東京都世田谷区太子堂1-1-1', phone: '03-1111-1111', note: '毎週水曜配送', isActive: true } });
    const cu1 = await prisma.customer.create({ data: { name: '中村 次郎', address: '東京都杉並区阿佐谷2-2-2', phone: '03-2222-2222', note: '在宅療養中・日中不在あり', isActive: true } });
    const cu2 = await prisma.customer.create({ data: { name: '小林 三郎', address: '東京都練馬区石神井3-3-3', phone: '03-3333-3333', note: '冷蔵保管必要', isActive: true } });
    const cu3 = await prisma.customer.create({ data: { name: '加藤 四郎', address: '東京都板橋区志村4-4-4', phone: '03-4444-4444', note: '午前中のみ受取可', isActive: true } });
    const cu4 = await prisma.customer.create({ data: { name: '吉田 五郎', address: '東京都北区赤羽5-5-5', phone: '03-5555-5555', isActive: true } });
    const cu5 = await prisma.customer.create({ data: { name: '渡辺 六子', address: '東京都足立区竹ノ塚6-6-6', phone: '03-6666-6666', note: '高齢・インターフォン必須', isActive: true } });
    const cu6 = await prisma.customer.create({ data: { name: '松本 七恵', address: '東京都葛飾区亀有7-7-7', phone: '03-7777-7777', isActive: true } });
    const cu7 = await prisma.customer.create({ data: { name: '井上 八重', address: '東京都江戸川区小岩8-8-8', phone: '03-8888-8888', note: 'ペットあり・チャイム2回', isActive: true } });

    // ── 配送 ──
    const deliveries = [
      { name: '処方薬 山田様', address: cu0.address, status: 'in_transit', deliveryDate: dateStr(0), staffId: st0.id, customerId: cu0.id, locationId: loc0.id },
      { name: '処方薬 中村様', address: cu1.address, status: 'pending', deliveryDate: dateStr(0), staffId: st1.id, customerId: cu1.id, locationId: loc0.id },
      { name: '医療用品 小林様', address: cu2.address, status: 'completed', deliveryDate: dateStr(0), staffId: st0.id, customerId: cu2.id, locationId: loc1.id },
      { name: '処方薬 加藤様', address: cu3.address, status: 'pending', deliveryDate: dateStr(1), staffId: st2.id, customerId: cu3.id, locationId: loc0.id },
      { name: '処方薬 吉田様', address: cu4.address, status: 'pending', deliveryDate: dateStr(1), staffId: st1.id, customerId: cu4.id, locationId: loc2.id },
      { name: '定期配送 渡辺様', address: cu5.address, status: 'pending', deliveryDate: dateStr(2), staffId: st3.id, customerId: cu5.id, locationId: loc1.id },
      { name: '処方薬 松本様', address: cu6.address, status: 'pending', deliveryDate: dateStr(2), staffId: st4.id, customerId: cu6.id, locationId: loc0.id },
      { name: '医療用品 井上様', address: cu7.address, status: 'pending', deliveryDate: dateStr(3), staffId: st0.id, customerId: cu7.id, locationId: loc2.id },
      { name: '処方薬 山田様（週次）', address: cu0.address, status: 'pending', deliveryDate: dateStr(4), staffId: st1.id, customerId: cu0.id, locationId: loc0.id },
      { name: '処方薬 中村様（週次）', address: cu1.address, status: 'pending', deliveryDate: dateStr(5), staffId: st2.id, customerId: cu1.id, locationId: loc0.id },
      { name: '処方薬 小林様', address: cu2.address, status: 'completed', deliveryDate: dateStr(-1), staffId: st0.id, customerId: cu2.id, locationId: loc1.id },
      { name: '医療用品 加藤様', address: cu3.address, status: 'completed', deliveryDate: dateStr(-2), staffId: st3.id, customerId: cu3.id, locationId: loc0.id },
      { name: '処方薬 吉田様', address: cu4.address, status: 'completed', deliveryDate: dateStr(-3), staffId: st4.id, customerId: cu4.id, locationId: loc2.id },
      { name: '未配送 渡辺様【要確認】', address: cu5.address, status: 'pending', deliveryDate: dateStr(-5), staffId: st1.id, customerId: cu5.id, locationId: loc1.id },
      { name: '未配送 松本様【要確認】', address: cu6.address, status: 'pending', deliveryDate: dateStr(-7), staffId: st2.id, customerId: cu6.id, locationId: loc0.id },
    ];

    for (const data of deliveries) {
      await prisma.delivery.create({ data });
    }

    return NextResponse.json({ success: true, message: 'デモデータをリセットしました' });
  } catch (error) {
    console.error('Demo reset error:', error);
    const message = error instanceof Error ? error.message : 'リセットに失敗しました';
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}