import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { createDeliverySchema } from '@/app/utils/validation';
import { formatZodErrors } from '@/app/utils/validation';
import { captureApiError, captureValidationError } from '@/app/utils/sentry';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token) return NextResponse.json({ error: '認証が必要です' }, { status: 401 });

    const deliveries = await prisma.delivery.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        staff: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(deliveries);
  } catch (error) {
    captureApiError(error, { endpoint: '/api/deliveries', method: 'GET' });
    return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token) return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    if (token.role !== 'admin') return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });

    const body = await req.json();
    const result = createDeliverySchema.safeParse(body);
    if (!result.success) {
      const errors = formatZodErrors(result.error);
      captureValidationError(errors, { endpoint: '/api/deliveries' });
      return NextResponse.json({ error: Object.values(errors)[0] }, { status: 400 });
    }

    const { staffId, customerId, ...rest } = body;
    const delivery = await prisma.delivery.create({
      data: {
        ...result.data,
        staffId: staffId || null,
        customerId: customerId || null,
      },
      include: {
        staff: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(delivery, { status: 201 });
  } catch (error) {
    captureApiError(error, { endpoint: '/api/deliveries', method: 'POST' });
    return NextResponse.json({ error: '配送データの作成に失敗しました' }, { status: 500 });
  }
}