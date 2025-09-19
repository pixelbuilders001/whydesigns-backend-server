import { AlreadyExistsError, NotFoundError } from "../../../../error";
import { validatePayloadSchema } from "../../../../utils/zod";
import { IRoleRepository } from "../repository/roleRepostory";
import {
  RoleUpdateValidationSchema,
  RoleSchema,
  RoleUpdateSchema,
  RoleValidationSchema,
} from "./validation";

export default class RoleService {
  private roleRepository: IRoleRepository;

  constructor(roleRepository: IRoleRepository) {
    this.roleRepository = roleRepository;
  }

  async getRoleById(roleId: number) {
    return await this.roleRepository.getRoleById(roleId);
  }

  async createRole(role: RoleValidationSchema) {
    const validatedRole = validatePayloadSchema(RoleSchema, role);

    const existingRole = await this.roleRepository.getRoleByName(
      validatedRole.name
    );

    if (existingRole) {
      throw new AlreadyExistsError("Role already exists");
    }

    const roleCreated = await this.roleRepository.createRole(validatedRole);
    return roleCreated;
  }

  async updateRole(roleId: number, role: RoleUpdateValidationSchema) {
    const isRoleExist = await this.getRoleById(roleId);

    if (!isRoleExist) {
      throw new NotFoundError("Role not found");
    }

    if (role?.name) {
      const isRoleNameExist = await this.roleRepository.getRoleByName(
        role.name
      );

      if (isRoleNameExist) {
        throw new AlreadyExistsError("Role name already exist");
      }
    }

    const validatedRole = validatePayloadSchema(RoleUpdateSchema, role);
    return await this.roleRepository.updateRole(roleId, validatedRole);
  }

  async getRoles(limit: number, page: number) {
    const { rows, count } = await this.roleRepository.getRoles(limit, page);

    return {
      roles: rows,
      currentPage: page,
      totalRecords: count,
      totalPages: Math.ceil(count / limit),
    };
  }

  async getRoleByName(name: string) {
    const role = await this.roleRepository.getRoleByName(name);
    return role;
  }

  async deleteRole(roleId: number) {
    const role = await this.getRoleById(roleId);
    if (!role) {
      throw new NotFoundError("Role not found");
    }
    return await this.roleRepository.deleteRole(roleId);
  }
}
