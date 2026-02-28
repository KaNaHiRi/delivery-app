import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { deliveryStore } from '@/lib/deliveryStore';
import { updateDeliverySchema, deliveryIdSchema, formatZodErrors } from '@/app/utils/validation';
import { captureApiError } from '@/app/utils/sentry';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const idResult = deliveryIdSchema.safeParse(id);
    if (!idResult.success) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const delivery = await deliveryStore.getById(id);
    if (!delivery) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    return NextResponse.json(delivery);
  } catch (error) {
    captureApiError(error, { endpoint: '/api/deliveries/[id]', method: 'GET' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const idResult = deliveryIdSchema.safeParse(id);
    if (!idResult.success) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const body = await req.json();
    const isStatusOnlyChange = Object.keys(body).length === 1 && 'status' in body;
    if (!isStatusOnlyChange && token.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = updateDeliverySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatZodErrors(result.error) },
        { status: 400 }
      );
    }

    const updated = await deliveryStore.update(id, result.data);
    if (!updated) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    captureApiError(error, { endpoint: '/api/deliveries/[id]', method: 'PUT' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (token.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const idResult = deliveryIdSchema.safeParse(id);
    if (!idResult.success) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const success = await deliveryStore.delete(id);
    if (!success) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    captureApiError(error, { endpoint: '/api/deliveries/[id]', method: 'DELETE' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}