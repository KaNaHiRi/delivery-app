// app/api/locations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const locations = await prisma.location.findMany({
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(locations);
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { name, address, phone } = body;

  if (!name || !address) {
    return NextResponse.json({ error: '拠点名と住所は必須です' }, { status: 400 });
  }

  const location = await prisma.location.create({
    data: { name, address, phone: phone || null },
  });
  return NextResponse.json(location, { status: 201 });
}