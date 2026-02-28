import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { captureApiError } from '@/app/utils/sentry';
import { z } from 'zod';

const staffSchema = z.object({
  name: z.string().min(1, '氏名は必須です').max(100),
  email: z.string().email('メールアドレスの形式が正しくありません'),
  phone: z.string().max(20).optional(),
  department: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token) return NextResponse.json({ error: '認証が必要です' }, { status: 401 });

    const staff = await prisma.staff.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(staff);
  } catch (error) {
    captureApiError(error, { endpoint: '/api/staff', method: 'GET' });
    return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token) return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    if (token.role !== 'admin') return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });

    const body = await req.json();
    const result = staffSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const staff = await prisma.staff.create({ data: result.data });
    return NextResponse.json(staff, { status: 201 });
  } catch (error) {
    captureApiError(error, { endpoint: '/api/staff', method: 'POST' });
    return NextResponse.json({ error: '担当者の作成に失敗しました' }, { status: 500 });
  }
}