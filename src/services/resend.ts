import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailOptions {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: {
    filename: string;
    content: string;
  }[];
}

export async function sendEmail({
  from,
  to,
  subject,
  html,
  replyTo,
  attachments,
}: SendEmailOptions): Promise<void> {
  const { error } = await resend.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    ...(replyTo && { reply_to: replyTo }),
    ...(attachments?.length && { attachments }),
  });

  if (error) {
    throw new Error(error.message);
  }
}
