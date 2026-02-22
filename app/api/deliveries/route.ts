import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { deliveryStore } from '@/lib/deliveryStore';
import type { Delivery } from '@/app/types/delivery';

// C# の [Authorize] + [HttpGet] に相当
export async function GET() {
  // 第3のRBACガード: サーバーサイドでセッション検証
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  const deliveries = deliveryStore.getAll();
  return NextResponse.json(deliveries);
}

// C# の [Authorize(Roles="admin")] + [HttpPost] に相当
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  // ロールチェック: adminのみ作成可能
  const role = (session.user as any).role;
  if (role !== 'admin') {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
  }

  const body = await request.json() as Omit<Delivery, 'id'>;
  const newDelivery: Delivery = {
    id: `DEL${Date.now()}`,
    name: body.name,
    address: body.address,
    status: body.status,
    deliveryDate: body.deliveryDate,
  };

  const deliveries = deliveryStore.getAll();
  deliveries.push(newDelivery);
  deliveryStore.save(deliveries);

  return NextResponse.json(newDelivery, { status: 201 });
}