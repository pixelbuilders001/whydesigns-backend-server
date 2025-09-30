import { Request, Response } from "express";
import asyncHandler from "../../../../common/asyncHandler";
import ExpressController from "../../../../common/ExpressController";
import CounselorService from "../service/counselorService";
import { StatusCodes } from "http-status-codes";
import { authMiddleware } from "../../../../middleware/authMiddleware";
import { counselorService } from "../../../../factory/ServiceFactory";

export default class CounselorController extends ExpressController {
  protected path = "/counselor";
  private counselorService: CounselorService;

  constructor(counselorService: CounselorService) {
    super();
    this.counselorService = counselorService;
    this.mapRoutes();
  }

  protected mapRoutes(): void {
    this.router.post(`${this.path}`, authMiddleware, asyncHandler(this.create));
    this.router.get(`${this.path}`, asyncHandler(this.list));
    this.router.get(`${this.path}/:id`, asyncHandler(this.getById));
    this.router.put(`${this.path}/:id`, authMiddleware, asyncHandler(this.update));
    this.router.delete(`${this.path}/:id`, authMiddleware, asyncHandler(this.remove));
  }

  create = async (req: Request, res: Response) => {
    const data = await this.counselorService.create(req.body);
    return this.sendSuccess(StatusCodes.CREATED, res, data, "Counselor created");
  };

  list = async (req: Request, res: Response) => {
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "10", 10);
    const { rows, count } = await this.counselorService.list(limit, page, req.query);
    return this.sendSuccessList(StatusCodes.OK, res, rows, count, page, limit);
  };

  getById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const data = await this.counselorService.getById(id);
    return this.sendSuccess(StatusCodes.OK, res, data);
  };

  update = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const data = await this.counselorService.update(id, req.body);
    return this.sendSuccess(StatusCodes.OK, res, data, "Counselor updated");
  };

  remove = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    await this.counselorService.delete(id);
    return this.sendSuccess(StatusCodes.NO_CONTENT, res, null as any, "Counselor deleted");
  };
}

export const counselorController = new CounselorController(counselorService);
