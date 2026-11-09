import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

// Sends email through Kitso's Google Workspace account (Gmail SMTP with an app
// password), so mail comes from info@kitsonexus.com and replies land in Gmail.

export type GmailAuth = { user: string; appPassword: string };

export function createGmailTransport(auth: GmailAuth): Transporter {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: auth.user, pass: auth.appPassword },
  });
}

export type Mail = {
  to: string[];
  cc?: string[];
  replyTo?: string;
  subject: string;
  text: string;
  html?: string;
};

/** Sends one email and returns the message id the mail server gave it. */
export async function sendMail(transport: Transporter, from: string, mail: Mail): Promise<string> {
  const info = await transport.sendMail({
    from,
    to: mail.to,
    cc: mail.cc,
    replyTo: mail.replyTo,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  });
  return info.messageId;
}
