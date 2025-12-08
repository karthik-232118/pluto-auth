"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
require("dotenv").config();
const transporter = nodemailer_1.default.createTransport({
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
const sendMail = async function (mailData) {
    const res = await transporter.sendMail(mailData);
    console.log(res);
    // transporter.close();
    return true;
};
exports.default = { sendMail };
