import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { deliveryStore } from '@/lib/deliveryStore';
import type { Delivery } from '@/app/types/delivery';

// C# の [HttpPut("{id}")] に相当
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  const role = (session.user as any).role;
  const { id } = await params;
  const body = await request.json() as Partial<Delivery>;

  const deliveries = deliveryStore.getAll();
  const index = deliveries.findIndex(d => d.id === id);

  if (index === -1) {
    return NextResponse.json({ error: '配送データが見つかりません' }, { status: 404 });
  }

  // ステータス変更はadmin/user両方可、それ以外の編集はadminのみ
  const isStatusOnlyChange = Object.keys(body).length === 1 && 'status' in body;
  if (!isStatusOnlyChange && role !== 'admin') {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
  }

  deliveries[index] = { ...deliveries[index], ...body };
  deliveryStore.save(deliveries);

  return NextResponse.json(deliveries[index]);
}

// C# の [HttpDelete("{id}")] に相当
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  const role = (session.user as any).role;
  if (role !== 'admin') {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
  }

  const { id } = await params;
  const deliveries = deliveryStore.getAll();
  const index = deliveries.findIndex(d => d.id === id);

  if (index === -1) {
    return NextResponse.json({ error: '配送データが見つかりません' }, { status: 404 });
  }

  deliveries.splice(index, 1);
  deliveryStore.save(deliveries);

  return NextResponse.json({ message: '削除しました' });
}