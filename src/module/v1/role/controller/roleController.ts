import { Request, Response } from "express";
import asyncHandler from "../../../../common/asyncHandler";
import ExpressController from "../../../../common/ExpressController";
import RoleService from "../service/roleService";
import { StatusCodes } from "http-status-codes";
import { roleService } from "../../../../factory/ServiceFactory";

export default class RoleController extends ExpressController {
  protected path = "/role";
  private roleService: RoleService;

  constructor(roleService: RoleService) {
    super();
    this.roleService = roleService;
    this.mapRoutes();
  }

  protected mapRoutes(): void {
    this.router.post(`${this.path}`, asyncHandler(this.createRole));
    this.router.get(`${this.path}`, asyncHandler(this.getRoles));
    this.router.put(`${this.path}/:id`, asyncHandler(this.updateRole));
    this.router.get(`${this.path}/:id`, asyncHandler(this.getRoleById));
    this.router.delete(`${this.path}/:id`, asyncHandler(this.deleteRole));
  }

  createRole = async (req: Request, res: Response) => {
    const role = await this.roleService.createRole(req.body);
    return this.sendSuccess(StatusCodes.CREATED, res, role);
  };

  getRoles = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const roles = await this.roleService.getRoles(limit, page);
    return this.sendSuccess(StatusCodes.OK, res, roles);
  };

  updateRole = async (req: Request, res: Response) => {
    const roleId = parseInt(req.params.id, 10);
    if (isNaN(roleId)) {
      return this.sendError(StatusCodes.BAD_REQUEST, res, "Invalid role ID");
    }
    const role = await this.roleService.updateRole(roleId, req.body);
    return this.sendSuccess(StatusCodes.OK, res, role);
  };

  getRoleById = async (req: Request, res: Response) => {
    const roleId = parseInt(req.params.id, 10);
    if (isNaN(roleId)) {
      return this.sendError(StatusCodes.BAD_REQUEST, res, "Invalid role ID");
    }
    const role = await this.roleService.getRoleById(roleId);
    return this.sendSuccess(StatusCodes.OK, res, role);
  };

  deleteRole = async (req: Request, res: Response) => {
    const roleId = parseInt(req.params.id, 10);
    if (isNaN(roleId)) {
      return this.sendError(StatusCodes.BAD_REQUEST, res, "Invalid role ID");
    }
    await this.roleService.deleteRole(roleId);
    return this.sendSuccess(
      StatusCodes.NO_CONTENT,
      res,
      null,
      "Role deleted successfully"
    );
  };
}

export const roleController = new RoleController(roleService);
