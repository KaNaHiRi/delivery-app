import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { deliveryStore } from '@/lib/deliveryStore';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const deliveries = await deliveryStore.getAll();
    return NextResponse.json(deliveries);
  } catch (error) {
    console.error('GET /api/deliveries error:', error);
    return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, address, status, deliveryDate } = body;
    if (!name || !address || !deliveryDate) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });
    }
    const delivery = await deliveryStore.create({
      name,
      address,
      status: status ?? 'pending',
      deliveryDate,
    });
    return NextResponse.json(delivery, { status: 201 });
  } catch (error) {
    console.error('POST /api/deliveries error:', error);
    return NextResponse.json({ error: '作成に失敗しました' }, { status: 500 });
  }
}