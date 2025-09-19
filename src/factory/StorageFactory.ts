import { S3Adapter } from "../adapters/storage/s3";
import { IStorageAdapter } from "../adapters/storage/type";

class StorageFactory {
  private static instance: IStorageAdapter;
  private static provider: string;

  public static getStorageAdapter(): IStorageAdapter {
    this.provider = process.env.STORAGE_PROVIDER || "s3";
    if (!this.instance) {
      switch (this.provider) {
        case "s3":
          this.instance = new S3Adapter();
          break;
        default:
          throw new Error("Invalid storage provider");
      }
    }
    return this.instance;
  }
}

export default StorageFactory;
