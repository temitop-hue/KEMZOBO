import { ENV } from "./env";

export type SendEmailOptions = {
  to: string;
  subject: string;
  content: string;
  html?: string;
};

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  if (!ENV.brevoApiKey) {
    console.warn("[Email] Brevo API key not configured, skipping email");
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
        sender: { name: "Kem Original Zobo", email: ENV.senderEmail },
        to: [{ email: options.to }],
        subject: options.subject,
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

    console.log(`[Email] Email sent to ${options.to}`);
    return true;
  } catch (error) {
    console.warn("[Email] Error sending email:", error);
    return false;
  }
}
