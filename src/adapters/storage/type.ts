export interface IStorageAdapter {
  uploadFile(
    username: string,
    fileName: string,
    body: Buffer,
    contentType: string
  ): Promise<string>;
  deleteFile(key: string): Promise<void>;
}
