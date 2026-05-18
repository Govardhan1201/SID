import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { to, subject, html, text } = await request.json();

    if (!to || !subject || (!html && !text)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // You MUST provide an App Password in your .env.local file.
    // E.g., EMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"
    const user = 'govardhannagireddy1356@gmail.com';
    const pass = process.env.EMAIL_APP_PASSWORD;

    if (!pass) {
      return NextResponse.json({ error: 'SMTP Credentials not configured on server' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Use SSL
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
