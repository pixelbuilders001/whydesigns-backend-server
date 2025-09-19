import { config } from "../../config";
import nodemailer from "nodemailer";

class NodemailerAdapter {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.nodemailer.SMTP_HOST,
      port: Number(config.nodemailer.SMTP_PORT),
      secure: Number(config.nodemailer.SMTP_PORT) === 465, // Use TLS
      auth: {
        user: config.nodemailer.SMTP_USER,
        pass: config.nodemailer.SMTP_PASS,
      },
    } as nodemailer.TransportOptions);
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: config.nodemailer.MAIL_FROM,
        to,
        subject,
        html,
      });

      console.log("SMTP Email Sent:", info.messageId);
      return info;
    } catch (error) {
      console.error("Nodemailer Error:", error);
      throw new Error("Nodemailer email sending failed");
    }
  }
}

export default NodemailerAdapter;
