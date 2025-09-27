import { Request, Response } from "express";
import asyncHandler from "../../../../common/asyncHandler";
import ExpressController from "../../../../common/ExpressController";
import ImageService from "../service/imageService";
import { StatusCodes } from "http-status-codes";
import { imageService } from "../../../../factory/ServiceFactory";
import { authMiddleware } from "../../../../middleware/authMiddleware";
import { singleMemoryUpload } from "../../../../middleware/file-upload.middleware";

export default class ImageController extends ExpressController {
  protected path = "/image";
  private imageService: ImageService;

  constructor(imageService: ImageService) {
    super();
    this.imageService = imageService;
    this.mapRoutes();
  }

  protected mapRoutes(): void {
    // Upload to S3: module as route param, file from multipart form-data "file",
    // userId from token via authMiddleware
    this.router.post(
      `${this.path}/:module/upload`,
      authMiddleware,
      singleMemoryUpload("file"),
      asyncHandler(this.uploadToS3)
    );

    // Delete from S3: expects body { fileUrl }
    this.router.delete(
      `${this.path}/:module`,
      authMiddleware,
      asyncHandler(this.deleteFromS3)
    );
  }

  // New: Upload to S3
  uploadToS3 = async (req: Request, res: Response) => {
    const moduleName = req.params.module;
    const rawUserId = (req as any).userId as number | string | undefined;
    const userId =
      typeof rawUserId === "string" ? parseInt(rawUserId, 10) : rawUserId;
    if (!userId || Number.isNaN(userId)) {
      return this.sendError(StatusCodes.UNAUTHORIZED, res, "Unauthorized");
    }
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file || !file.buffer) {
      return this.sendBadRequest(res, "File is required");
    }
    const result = await this.imageService.uploadImage(moduleName, userId, {
      originalname: file.originalname,
      mimetype: file.mimetype,
      buffer: file.buffer,
    });
    return this.sendSuccess(
      StatusCodes.CREATED,
      res,
      result,
      "Uploaded successfully"
    );
  };

  // New: Delete from S3 by URL
  deleteFromS3 = async (req: Request, res: Response) => {
    const { fileUrl } = req.body as { fileUrl?: string };
    if (!fileUrl) {
      return this.sendBadRequest(res, "fileUrl is required");
    }
    await this.imageService.deleteImageByUrl(fileUrl);
    return this.sendSuccess(
      StatusCodes.OK,
      res,
      { deleted: true },
      "Deleted successfully"
    );
  };
}

export const imageController = new ImageController(imageService);
