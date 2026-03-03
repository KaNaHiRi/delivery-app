// app/api/deliveries/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { updateDeliverySchema } from '@/app/utils/validation';
import { createAuditLog } from '@/lib/auditLog';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const result = updateDeliverySchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues }, { status: 400 });
  }

  // ステータス変更のみ一般ユーザーも可
  const isStatusOnlyUpdate =
    Object.keys(result.data).length === 1 && 'status' in result.data;
  if (!isStatusOnlyUpdate && token.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 変更前の値を取得
  const before = await prisma.delivery.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const delivery = await prisma.delivery.update({
    where: { id },
    data: {
      ...(result.data.name         !== undefined ? { name:         result.data.name }         : {}),
      ...(result.data.address      !== undefined ? { address:      result.data.address }      : {}),
      ...(result.data.status       !== undefined ? { status:       result.data.status }       : {}),
      ...(result.data.deliveryDate !== undefined ? { deliveryDate: result.data.deliveryDate } : {}),
      ...(result.data.staffId      !== undefined ? { staffId:      result.data.staffId }      : {}),
      ...(result.data.customerId   !== undefined ? { customerId:   result.data.customerId }   : {}),
      ...(result.data.locationId   !== undefined ? { locationId:   result.data.locationId }   : {}),
    },
    include: {
      staff:    { select: { id: true, name: true } },
      customer: { select: { id: true, name: true } },
      location: { select: { id: true, name: true } },
    },
  });

  // ── Day 41: 変更差分を計算してログ記録 ──
  const changedFields: Record<string, unknown> = {};
  const oldFields:     Record<string, unknown> = {};
  for (const key of Object.keys(result.data) as (keyof typeof result.data)[]) {
    const newVal = result.data[key];
    const oldVal = (before as Record<string, unknown>)[key];
    if (newVal !== oldVal) {
      changedFields[key] = newVal;
      oldFields[key]     = oldVal;
    }
  }
  if (Object.keys(changedFields).length > 0) {
    await createAuditLog({
      action:     'UPDATE',
      entityType: 'Delivery',
      entityId:   delivery.id,
      entityName: delivery.name,
      oldValues:  oldFields,
      newValues:  changedFields,
      userId:     token.email as string ?? null,
      userName:   token.name  as string ?? null,
    });
  }

  return NextResponse.json(delivery);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (token.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;

  // 削除前に情報を取得
  const before = await prisma.delivery.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.delivery.delete({ where: { id } });

  await createAuditLog({
    action:     'DELETE',
    entityType: 'Delivery',
    entityId:   id,
    entityName: before.name,
    oldValues:  { name: before.name, address: before.address, status: before.status, deliveryDate: before.deliveryDate },
    userId:     token.email as string ?? null,
    userName:   token.name  as string ?? null,
  });

  return NextResponse.json({ success: true });
}