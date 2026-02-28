import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { captureApiError } from '@/app/utils/sentry';
import { z } from 'zod';

const updateCustomerSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  address: z.string().min(1).max(200).optional(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  note: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token) return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    if (token.role !== 'admin') return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const result = updateCustomerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const customer = await prisma.customer.update({ where: { id }, data: result.data });
    return NextResponse.json(customer);
  } catch (error) {
    captureApiError(error, { endpoint: '/api/customers/[id]', method: 'PUT' });
    return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token) return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    if (token.role !== 'admin') return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });

    const { id } = await params;
    await prisma.customer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    captureApiError(error, { endpoint: '/api/customers/[id]', method: 'DELETE' });
    return NextResponse.json({ error: '削除に失敗しました' }, { status: 500 });
  }
}