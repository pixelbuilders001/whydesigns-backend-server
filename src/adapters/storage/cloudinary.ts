// import { IStorageAdapter } from "./type";

// class CloudinaryAdapter implements IStorageAdapter {
//   private cloudinary: Cloudinary;
//   constructor() {
//     this.cloudinary = new Cloudinary({
//       cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
//       api_key: process.env.CLOUDINARY_API_KEY!,
//       api_secret: process.env.CLOUDINARY_API_SECRET!,
//     });
//   }

//   uploadFile(key: string, body: Buffer, contentType: string): Promise<string> {
//     return this.cloudinary.uploader.upload_stream({
//       resource_type: "auto",
//       public_id: key,
//       format: "auto",
//       secure: true,
//     }, body);
//   }
//   deleteFile(key: string): Promise<void> {
//     return this.cloudinary.uploader.destroy(key);
//   }
// }

// this is for testing adaptor factory method for storage.
