import nodemailer from "nodemailer";

import { env } from "~/env";

type DeliveryChannel = "smtp" | "console";

type EmailDeliveryResult =
  | { success: true; channel: "smtp" }
  | { success: false; channel: "console"; fallbackCode: string };

const getSmtpTransport = () => {
  if (!env.SMTP_EMAIL || !env.SMTP_APP_PASSWORD) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.SMTP_EMAIL,
      pass: env.SMTP_APP_PASSWORD,
    },
  });
};

export const sendLoginCodeEmail = async (
  to: string,
  code: string
): Promise<EmailDeliveryResult> => {
  const smtpTransport = getSmtpTransport();
  if (smtpTransport) {
    try {
      await smtpTransport.sendMail({
        from: env.EMAIL_FROM_ADDRESS ?? env.SMTP_EMAIL,
        to,
        subject: "Your Digital Menu verification code",
        text: `Use the code ${code} to finish signing in. It will expire in 10 minutes.`,
      });

      return { success: true, channel: "smtp" };
    } catch (error) {
      console.error("[auth.email.smtp]", error);
    }
  }

  console.info(`[auth] Verification code for ${to}: ${code}`);
  return {
    success: false,
    channel: "console",
    fallbackCode: code,
  };
};
