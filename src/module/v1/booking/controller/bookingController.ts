import { Request, Response } from "express";
import asyncHandler from "../../../../common/asyncHandler";
import ExpressController from "../../../../common/ExpressController";
import BookingService from "../service/bookingService";
import { StatusCodes } from "http-status-codes";
import { authMiddleware } from "../../../../middleware/authMiddleware";
import { bookingService } from "../../../../factory/ServiceFactory";

export default class BookingController extends ExpressController {
  protected path = "/booking";
  private bookingService: BookingService;

  constructor(bookingService: BookingService) {
    super();
    this.bookingService = bookingService;
    this.mapRoutes();
  }

  protected mapRoutes(): void {
    this.router.post(`${this.path}`, authMiddleware, asyncHandler(this.create));
    this.router.get(`${this.path}`, authMiddleware, asyncHandler(this.list));
    this.router.get(
      `${this.path}/upcoming`,
      authMiddleware,
      asyncHandler(this.getUpcomingBookings)
    );
    this.router.get(
      `${this.path}/:id`,
      authMiddleware,
      asyncHandler(this.getById)
    );
    this.router.put(
      `${this.path}/:id`,
      authMiddleware,
      asyncHandler(this.update)
    );
    this.router.put(
      `${this.path}/:id/confirm`,
      authMiddleware,
      asyncHandler(this.confirmBooking)
    );
    this.router.put(
      `${this.path}/:id/complete`,
      authMiddleware,
      asyncHandler(this.completeBooking)
    );
    this.router.put(
      `${this.path}/:id/cancel`,
      authMiddleware,
      asyncHandler(this.cancelBooking)
    );
    this.router.delete(
      `${this.path}/:id`,
      authMiddleware,
      asyncHandler(this.remove)
    );
  }

  create = async (req: Request, res: Response) => {
    const userId = Number((req as any).userId);
    const data = await this.bookingService.create({ ...req.body, userId });
    return this.sendSuccess(
      StatusCodes.CREATED,
      res,
      data,
      "Booking created successfully"
    );
  };

  list = async (req: Request, res: Response) => {
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "10", 10);
    const userId = Number((req as any).userId);
    const userRole = (req as any).userRole;

    const { rows, count } = await this.bookingService.list(
      limit,
      page,
      req.query,
      userId,
      userRole
    );
    return this.sendSuccessList(StatusCodes.OK, res, rows, count, page, limit);
  };

  getById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    const data = await this.bookingService.getById(id, userId, userRole);
    return this.sendSuccess(StatusCodes.OK, res, data);
  };

  getUpcomingBookings = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    const data = await this.bookingService.getUpcomingBookings(
      undefined,
      userId,
      userRole
    );
    return this.sendSuccess(
      StatusCodes.OK,
      res,
      data,
      "Upcoming bookings retrieved successfully"
    );
  };

  update = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    const data = await this.bookingService.update(
      id,
      req.body,
      userId,
      userRole
    );
    return this.sendSuccess(
      StatusCodes.OK,
      res,
      data,
      "Booking updated successfully"
    );
  };

  confirmBooking = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const counselorId = (req as any).counselorId; // Assuming counselor has counselorId in token
    const userRole = (req as any).userRole;

    const data = await this.bookingService.confirmBooking(
      id,
      counselorId,
      userRole
    );
    return this.sendSuccess(
      StatusCodes.OK,
      res,
      data,
      "Booking confirmed successfully"
    );
  };

  completeBooking = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const counselorId = (req as any).counselorId; // Assuming counselor has counselorId in token
    const userRole = (req as any).userRole;

    const data = await this.bookingService.completeBooking(
      id,
      counselorId,
      userRole
    );
    return this.sendSuccess(
      StatusCodes.OK,
      res,
      data,
      "Booking completed successfully"
    );
  };

  cancelBooking = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const userId = (req as any).userId;
    const counselorId = (req as any).counselorId; // Assuming counselor has counselorId in token
    const userRole = (req as any).userRole;

    const data = await this.bookingService.cancelBooking(
      id,
      userId,
      counselorId,
      userRole
    );
    return this.sendSuccess(
      StatusCodes.OK,
      res,
      data,
      "Booking cancelled successfully"
    );
  };

  remove = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    await this.bookingService.delete(id, userId, userRole);
    return this.sendSuccess(
      StatusCodes.NO_CONTENT,
      res,
      null as any,
      "Booking deleted successfully"
    );
  };
}

export const bookingController = new BookingController(bookingService);
