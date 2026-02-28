import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { captureApiError } from '@/app/utils/sentry';
import { z } from 'zod';

const customerSchema = z.object({
  name: z.string().min(1, '氏名は必須です').max(100),
  address: z.string().min(1, '住所は必須です').max(200),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal('')),
  note: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token) return NextResponse.json({ error: '認証が必要です' }, { status: 401 });

    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(customers);
  } catch (error) {
    captureApiError(error, { endpoint: '/api/customers', method: 'GET' });
    return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token) return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    if (token.role !== 'admin') return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });

    const body = await req.json();
    const result = customerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const customer = await prisma.customer.create({ data: result.data });
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    captureApiError(error, { endpoint: '/api/customers', method: 'POST' });
    return NextResponse.json({ error: '顧客の作成に失敗しました' }, { status: 500 });
  }
}