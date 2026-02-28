import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { deliveryStore } from '@/lib/deliveryStore';
import { createDeliverySchema, formatZodErrors } from '@/app/utils/validation';
import { captureApiError } from '@/app/utils/sentry';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const deliveries = await deliveryStore.getAll();
    return NextResponse.json(deliveries);
  } catch (error) {
    captureApiError(error, { endpoint: '/api/deliveries', method: 'GET' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (token.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const result = createDeliverySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatZodErrors(result.error) },
        { status: 400 }
      );
    }

    const delivery = await deliveryStore.create(result.data);
    return NextResponse.json(delivery, { status: 201 });
  } catch (error) {
    captureApiError(error, { endpoint: '/api/deliveries', method: 'POST' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}