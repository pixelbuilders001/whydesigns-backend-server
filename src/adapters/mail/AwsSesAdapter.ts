import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { config } from "../../config";

class AwsSesAdapter {
  private client: SESClient;
  private senderEmail: string;

  constructor() {
    this.client = new SESClient({
      region: config.aws.AWS_REGION,
      credentials: {
        accessKeyId: config.aws.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.aws.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.senderEmail = config.aws.MAIL_FROM;
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      const command = new SendEmailCommand({
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Body: {
            Html: {
              Charset: "UTF-8",
              Data: html,
            },
          },
          Subject: {
            Charset: "UTF-8",
            Data: subject,
          },
        },
        Source: this.senderEmail,
      });

      const response = await this.client.send(command);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to send email: ${error.message}`);
      }
      throw new Error('Failed to send email');
    }
  }
}

export default AwsSesAdapter;
