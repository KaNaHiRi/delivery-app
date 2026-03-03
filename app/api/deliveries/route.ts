// app/api/deliveries/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { createDeliverySchema } from '@/app/utils/validation';
import { createAuditLog } from '@/lib/auditLog';

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get('locationId') ?? undefined;

  const deliveries = await prisma.delivery.findMany({
    where: locationId ? { locationId } : undefined,
    include: {
      staff:    { select: { id: true, name: true } },
      customer: { select: { id: true, name: true } },
      location: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(deliveries);
}

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (token.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const result = createDeliverySchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues }, { status: 400 });
  }

  const delivery = await prisma.delivery.create({
    data: {
      name:         result.data.name,
      address:      result.data.address,
      status:       result.data.status ?? 'pending',
      deliveryDate: result.data.deliveryDate,
      staffId:      result.data.staffId    ?? null,
      customerId:   result.data.customerId ?? null,
      locationId:   result.data.locationId ?? null,
    },
    include: {
      staff:    { select: { id: true, name: true } },
      customer: { select: { id: true, name: true } },
      location: { select: { id: true, name: true } },
    },
  });

  await createAuditLog({
    action:     'CREATE',
    entityType: 'Delivery',
    entityId:   delivery.id,
    entityName: delivery.name,
    newValues:  { name: delivery.name, address: delivery.address, status: delivery.status, deliveryDate: delivery.deliveryDate },
    userId:     token.email as string ?? null,
    userName:   token.name  as string ?? null,
  });

  return NextResponse.json(delivery, { status: 201 });
}