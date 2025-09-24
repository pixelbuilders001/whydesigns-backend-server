import multer, { FileFilterCallback, Options } from "multer";
import { Request, Response, NextFunction } from "express";

type FileExtension =
  | ".jpg"
  | ".jpeg"
  | ".png"
  | ".gif"
  | ".webp"
  | ".pdf"
  | ".xlsx"
  | ".xls"
  | ".csv"
  | ".txt";
type MimeType =
  | "image/jpeg"
  | "image/png"
  | "image/gif"
  | "image/webp"
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "application/vnd.ms-excel"
  | "text/csv"
  | "text/plain";

// File type configuration
const fileTypes = {
  // Images
  images: {
    extensions: [".jpg", ".jpeg", ".png", ".gif", ".webp"] as FileExtension[],
    mimeTypes: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ] as MimeType[],
  },
  // Documents
  documents: {
    extensions: [".pdf", ".xlsx", ".xls", ".csv", ".txt"] as FileExtension[],
    mimeTypes: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "text/plain",
    ] as MimeType[],
  },
} as const;

// Combine all allowed MIME types
const allowedMimeTypes = [
  ...fileTypes.images.mimeTypes,
  ...fileTypes.documents.mimeTypes,
];

// Combine all allowed extensions
const allowedExtensions = [
  ...fileTypes.images.extensions,
  ...fileTypes.documents.extensions,
];

// Human-readable file type names for error messages
const fileTypeNames = {
  images: "Images (JPG, JPEG, PNG, GIF, WebP)",
  documents: "Documents (PDF, XLSX, XLS, CSV, TXT)",
} as const;

// Configure multer to use disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // You can customize the destination path as needed
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Generate a unique filename with timestamp and original name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

// Configure multer to use memory storage for S3 uploads
const memoryStorage = multer.memoryStorage();

// File filter function with proper typing
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  // Check file extension
  const fileExt = file.originalname.split(".").pop()?.toLowerCase() as
    | FileExtension
    | undefined;
  const fileExtWithDot = fileExt ? (`.${fileExt}` as FileExtension) : null;
  const isValidExtension = fileExtWithDot
    ? allowedExtensions.includes(fileExtWithDot)
    : false;

  // Check MIME type
  const isValidMimeType = file.mimetype
    ? allowedMimeTypes.includes(file.mimetype as MimeType)
    : false;

  if (!isValidExtension || !isValidMimeType) {
    return cb(
      new Error(
        `Invalid file type. Allowed types: ${Object.values(fileTypeNames).join(
          ", "
        )}`
      )
    );
  }

  cb(null, true);
};

// Upload limits configuration
const limits: Options["limits"] = {
  fileSize: 5 * 1024 * 1024, // 5MB
  files: 5, // Maximum number of files
  fields: 10, // Maximum number of non-file fields
};

// Configure multer with our settings
const upload = multer({
  storage,
  fileFilter,
  limits,
});

// Memory storage for direct-to-S3 uploads
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits,
});

/**
 * Middleware for handling single file uploads
 * @param fieldName - Name of the form field containing the file
 */
export const singleFileUpload = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.single(fieldName)(req, res, (err: any) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File too large. Maximum size allowed is 5MB",
          });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
          return res.status(400).json({
            success: false,
            message: "Too many files. Maximum 5 files allowed",
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  };
};

/**
 * Middleware for handling single file uploads in memory (buffer)
 * Suitable for uploading directly to S3.
 */
export const singleMemoryUpload = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    memoryUpload.single(fieldName)(req, res, (err: any) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File too large. Maximum size allowed is 5MB",
          });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
          return res.status(400).json({
            success: false,
            message: "Too many files. Maximum 5 files allowed",
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  };
};

/**
 * Middleware for handling multiple file uploads in memory (buffers)
 */
export const multipleMemoryUpload = (fieldName: string, maxCount: number = 5) => {
  return (req: Request, res: Response, next: NextFunction) => {
    memoryUpload.array(fieldName, maxCount)(req, res, (err: any) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File too large. Maximum size allowed is 5MB",
          });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
          return res.status(400).json({
            success: false,
            message: `Too many files. Maximum ${maxCount} files allowed`,
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  };
};

/**
 * Middleware for handling multiple file uploads
 * @param fieldName - Name of the form field containing the files
 * @param maxCount - Maximum number of files allowed (default: 5)
 */
export const multipleFileUpload = (fieldName: string, maxCount: number = 5) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.array(fieldName, maxCount)(req, res, (err: any) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File too large. Maximum size allowed is 5MB",
          });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
          return res.status(400).json({
            success: false,
            message: `Too many files. Maximum ${maxCount} files allowed`,
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  };
};

// Export the configured multer instance for custom use
export { upload };
