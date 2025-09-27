import { NotFoundError } from "../../../../error";
import { IStorageAdapter } from "../../../../adapters/storage/type";
import { config } from "../../../../config";

export default class ImageService {
  private storageAdapter: IStorageAdapter;

  constructor(storageAdapter: IStorageAdapter) {
    this.storageAdapter = storageAdapter;
  }

  // Upload a file to S3 and return its public URL and key
  async uploadImage(
    moduleName: string,
    userId: number,
    file: { originalname: string; mimetype: string; buffer: Buffer }
  ) {
    if (!file || !file.buffer) throw new NotFoundError("File is required");
    const moduleSegment = `user_${userId}`; // first folder
    const usernameSegment = moduleName; // second folder per requirement
    const fileUrl = await this.storageAdapter.uploadFile(
      moduleSegment,
      usernameSegment,
      file.originalname,
      file.buffer,
      file.mimetype
    );

    // Also compute key for client convenience
    const key = this.extractKeyFromUrl(fileUrl);
    return { url: fileUrl, key };
  }

  // Delete a file from S3 using its public URL
  async deleteImageByUrl(fileUrl: string) {
    if (!fileUrl) throw new NotFoundError("fileUrl is required");
    const key = this.extractKeyFromUrl(fileUrl);
    await this.storageAdapter.deleteFile(key);
    return { deleted: true };
  }

  private extractKeyFromUrl(url: string): string {
    // Expected format: https://<bucket>.s3.<region>.amazonaws.com/<key>
    const bucket = config.s3.bucketName;
    const region = config.s3.region;
    const prefix = `https://${bucket}.s3.${region}.amazonaws.com/`;
    if (url.startsWith(prefix)) return url.substring(prefix.length);
    // Fallback: try to split by domain
    const parts = url.split('.amazonaws.com/');
    return parts.length > 1 ? parts[1] : url;
  }
}
