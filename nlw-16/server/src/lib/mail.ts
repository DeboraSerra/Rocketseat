import { createTestAccount, createTransport } from "nodemailer";

export const getMailClient = async () => {
  const account = await createTestAccount();

  const transporter = createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: account.user,
      pass: account.pass,
    }
  });

  return transporter;
};
