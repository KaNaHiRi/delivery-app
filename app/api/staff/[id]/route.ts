import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { captureApiError } from '@/app/utils/sentry';
import { z } from 'zod';

const updateStaffSchema = z.object({
  name: z.string().min(1, '氏名は必須です').max(100).optional(),
  email: z.string().email('メールアドレスの形式が正しくありません').optional(),
  phone: z.string().max(20).optional().nullable(),
  department: z.string().max(100).optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token) return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    if (token.role !== 'admin') return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const result = updateStaffSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const staff = await prisma.staff.update({ where: { id }, data: result.data });
    return NextResponse.json(staff);
  } catch (error) {
    captureApiError(error, { endpoint: '/api/staff/[id]', method: 'PUT' });
    return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token) return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    if (token.role !== 'admin') return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });

    const { id } = await params;
    await prisma.staff.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    captureApiError(error, { endpoint: '/api/staff/[id]', method: 'DELETE' });
    return NextResponse.json({ error: '削除に失敗しました' }, { status: 500 });
  }
}