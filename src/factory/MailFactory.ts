import AwsSesAdapter from "../adapters/mail/AwsSesAdapter";
import NodemailerAdapter from "../adapters/mail/NodeMailerAdapter";

class MailAdapterFactory {
  static getAdapter(provider: string) {
    switch (provider) {
      case "ses":
        return new AwsSesAdapter();
      case "nodemailer":
        return new NodemailerAdapter();
      default:
        throw new Error("Invalid mail provider selected");
    }
  }
}

export default MailAdapterFactory;
