import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { deliveryStore } from '@/lib/deliveryStore';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const userRole = (session.user as any)?.role;

  const isStatusOnly = Object.keys(body).length === 1 && 'status' in body;
  if (!isStatusOnly && userRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const updated = await deliveryStore.update(id, body);
    if (!updated) return NextResponse.json({ error: '対象が見つかりません' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/deliveries/[id] error:', error);
    return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  try {
    const success = await deliveryStore.delete(id);
    if (!success) return NextResponse.json({ error: '対象が見つかりません' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/deliveries/[id] error:', error);
    return NextResponse.json({ error: '削除に失敗しました' }, { status: 500 });
  }
}