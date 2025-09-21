// import { IStorageAdapter } from "./type";
// import { Cloudinary } from "cloudinary";
// import { generateS3Path } from "../../common/s3Utils";

// class CloudinaryAdapter implements IStorageAdapter {
//   private cloudinary: Cloudinary;
//   constructor() {
//     this.cloudinary = new Cloudinary({
//       cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
//       api_key: process.env.CLOUDINARY_API_KEY!,
//       api_secret: process.env.CLOUDINARY_API_SECRET!,
//     });
//   }

//   uploadFile(username: string, fileName: string, body: Buffer, contentType: string): Promise<string> {
//     return this.cloudinary.uploader.upload_stream({
//       resource_type: "auto",
//       public_id: generateS3Path("user", username, fileName),
//       format: "auto",
//       secure: true,
//     }, body);
//   }
//   deleteFile(key: string): Promise<void> {
//     return this.cloudinary.uploader.destroy(key);
//   }
// }

// // this is for testing adaptor factory method for storage.
