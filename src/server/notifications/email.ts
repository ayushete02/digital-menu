import { Resend } from "resend";

import { env } from "~/env";

const getClient = () => {
  if (!env.RESEND_API_KEY) return null;
  return new Resend(env.RESEND_API_KEY);
};

export const sendLoginCodeEmail = async (to: string, code: string) => {
  const client = getClient();

  if (!client) {
    console.info(`[auth] Verification code for ${to}: ${code}`);
    return;
  }

  await client.emails.send({
    from: env.EMAIL_FROM_ADDRESS ?? "menu@digital.app",
    to,
    subject: "Your Digital Menu verification code",
    text: `Use the code ${code} to finish signing in. It will expire in 10 minutes.`,
  });
};
