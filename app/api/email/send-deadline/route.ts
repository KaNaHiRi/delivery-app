import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { DeliveryDeadlineEmail } from '@/app/emails/DeliveryDeadlineEmail';
import { getToken } from 'next-auth/jwt';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { recipientEmail, recipientName, deliveries } = body;

    if (!recipientEmail || !Array.isArray(deliveries) || deliveries.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const html = await render(
      DeliveryDeadlineEmail({
        recipientName: recipientName ?? '担当者',
        deliveries,
      })
    );

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'onboarding@resend.dev',
      to: recipientEmail,
      subject: `【配送管理】⚠️ 期限アラート (${deliveries.length}件)`,
      html,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to send email' },
      { status: 500 }
    );
  }
}