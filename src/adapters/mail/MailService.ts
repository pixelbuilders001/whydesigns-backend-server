import { config } from "../../config";
import MailAdapterFactory from "../../factory/MailFactory";
import NodemailerAdapter from "./NodeMailerAdapter";
import AwsSesAdapter from "./AwsSesAdapter";

type MailAdapter = NodemailerAdapter | AwsSesAdapter;

class MailService {
  private mailAdapter: MailAdapter;

  constructor() {
    this.mailAdapter = MailAdapterFactory.getAdapter(
      config.mail.MAIL_PROVIDER || "ses"
    );
  }

  async sendMail(to: string, subject: string, html: string) {
    return this.mailAdapter.sendMail(to, subject, html);
  }
}

export default new MailService();
