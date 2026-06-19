import { z } from "zod";

const resendEndpoint = "https://api.resend.com/emails";

const emailPayloadSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  html: z.string().min(1),
});

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

const formatError = (status: number, body: unknown) =>
  `Failed to send email (status ${status}): ${JSON.stringify(body)}`;

export async function sendEmail(input: SendEmailInput) {
  const payload = emailPayloadSchema.parse(input);
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "RESEND_API_KEY is not configured. Unable to send transactional emails.",
      );
    }

    console.info(
      "[auth] Email service not configured. Verification email payload:",
      payload,
    );
    return;
  }

  const response = await fetch(resendEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? "noreply@example.com",
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(formatError(response.status, body));
  }
}
