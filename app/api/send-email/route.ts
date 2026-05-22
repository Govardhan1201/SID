import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { to, subject, html, text } = await request.json();

    if (!to || !subject || (!html && !text)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use environment variables for Mailrelay configuration
    const host = process.env.SMTP_HOST || 'smtp.mailrelay.com';
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER || process.env.EMAIL_APP_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_APP_PASSWORD;

    if (!user || !pass) {
      console.warn('SMTP_USER or SMTP_PASS not set. Logging email instead of sending:', { to, subject });
      return NextResponse.json({ success: true, messageId: 'simulated-id' });
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // Use SSL for 465, TLS for 587
      auth: { user, pass }
    });

    const info = await transporter.sendMail({
      from: `"IdeaForge Hackathons" <${user}>`,
      to,
      subject,
      text,
      html
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('Email send failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
