import { ENV } from "./env";

export type SendEmailOptions = {
  to: string | string[];
  bcc?: string | string[];
  subject: string;
  content: string;
  html?: string;
  replyTo?: { email: string; name?: string };
};

function parseAddresses(input: string | string[] | undefined): { email: string }[] {
  if (!input) return [];
  return (Array.isArray(input) ? input : [input])
    .flatMap((s) => s.split(","))
    .map((s) => s.trim())
    .filter(Boolean)
    .map((email) => ({ email }));
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  if (!ENV.brevoApiKey) {
    console.warn("[Email] Brevo API key not configured, skipping email");
    return false;
  }

  const recipients = parseAddresses(options.to);
  const bcc = parseAddresses(options.bcc);

  if (recipients.length === 0) {
    console.warn("[Email] No recipients, skipping");
    return false;
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": ENV.brevoApiKey,
      },
      body: JSON.stringify({
        sender: { name: "KEMZOBO", email: ENV.senderEmail },
        to: recipients,
        ...(bcc.length > 0 ? { bcc } : {}),
        subject: options.subject,
        ...(options.replyTo ? { replyTo: options.replyTo } : {}),
        ...(options.html
          ? { htmlContent: options.html }
          : { textContent: options.content }),
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(`[Email] Failed to send (${response.status}): ${detail}`);
      return false;
    }

    console.log(`[Email] Email sent to ${recipients.map((r) => r.email).join(", ")}`);
    return true;
  } catch (error) {
    console.warn("[Email] Error sending email:", error);
    return false;
  }
}
