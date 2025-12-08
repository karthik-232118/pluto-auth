import nodemailer from "nodemailer";
require("dotenv").config();

const transporter = nodemailer.createTransport({
  pool: true,
  maxConnections: 11,
  maxMessages: Infinity,
  host: String(process.env.MAIL_HOST),
  port: Number(process.env.MAIL_PORT),
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendMail = async function (mailData: any) {
  const res = await transporter.sendMail(mailData);
  console.log(res);
  // transporter.close();
  return true;
};

export default { sendMail };
