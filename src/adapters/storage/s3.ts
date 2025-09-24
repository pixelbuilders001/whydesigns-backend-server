import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { IStorageAdapter } from "./type";
import { config } from "../../config";
import { generateS3Path } from "../../common/s3Utils";
import { ILoggerAdapter } from "../../adapters/logger/LoggerAdapter";
import LoggerAdapterFactory from "../../factory/LoggerFactory";

interface UploadParams {
  Bucket: string;
  Key: string;
  Body: Buffer | Readable;
  ContentType: string;
}

interface DeleteParams {
  Bucket: string;
  Key: string;
}

export class S3Adapter implements IStorageAdapter {
  private s3: S3Client;
  private bucketName: string;
  private logger: ILoggerAdapter;

  constructor() {
    this.logger = LoggerAdapterFactory.getAdapter(config.logger.LOG_PROVIDER);
    this.s3 = new S3Client({
      region: config.s3.region,
      credentials: config.s3.credentials,
    });
    this.bucketName = config.s3.bucketName;
  }

  async uploadFile(
    module: string,
    username: string,
    fileName: string,
    body: Buffer,
    contentType: string
  ): Promise<string> {
    const key = generateS3Path(module, username, fileName);
    const uploadParams: UploadParams = {
      Bucket: this.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    };

    try {
      await this.s3.send(new PutObjectCommand(uploadParams));
      return `https://${this.bucketName}.s3.${config.s3.region}.amazonaws.com/${key}`;
    } catch (error) {
      this.logger.error("Failed to upload file to S3", {
        error,
        key,
        bucket: this.bucketName,
        region: config.s3.region,
      });
      throw new Error("Failed to upload file to S3");
    }
  }

  async deleteFile(key: string): Promise<void> {
    const deleteParams: DeleteParams = {
      Bucket: this.bucketName,
      Key: key,
    };

    await this.s3.send(new DeleteObjectCommand(deleteParams));
  }
}
