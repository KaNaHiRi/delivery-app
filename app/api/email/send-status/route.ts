import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { DeliveryStatusEmail } from '@/app/emails/DeliveryStatusEmail';
import { getToken } from 'next-auth/jwt';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  // JWT検証（認証済みユーザーのみ）
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      recipientEmail,
      recipientName,
      deliveryName,
      deliveryAddress,
      deliveryDate,
      oldStatus,
      newStatus,
    } = body;

    if (!recipientEmail || !deliveryName || !newStatus) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const html = await render(
      DeliveryStatusEmail({
        recipientName: recipientName ?? '担当者',
        deliveryName,
        deliveryAddress: deliveryAddress ?? '',
        deliveryDate: deliveryDate ?? '',
        oldStatus: oldStatus ?? '',
        newStatus,
        changedBy: token.email as string ?? '不明',
      })
    );

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'onboarding@resend.dev',
      to: recipientEmail,
      subject: `【配送管理】ステータス更新: ${deliveryName}`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error('Email send error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to send email' },
      { status: 500 }
    );
  }
}