export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}) {
  const res = await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to send email');
  }
  return data;
}
