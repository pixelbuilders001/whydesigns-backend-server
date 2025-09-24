export interface IStorageAdapter {
  uploadFile(
    module: string,
    username: string,
    fileName: string,
    body: Buffer,
    contentType: string
  ): Promise<string>;
  deleteFile(key: string): Promise<void>;
}
