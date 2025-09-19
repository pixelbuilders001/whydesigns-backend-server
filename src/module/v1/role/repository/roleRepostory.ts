import Role from "../../../../../db/models/auth/role.model";
import { RoleValidationSchema } from "../service/validation";

export interface IRoleRepository {
  createRole(role: RoleValidationSchema): Promise<any>;
  getRoleById(roleId: number): Promise<any>;
  updateRole(roleId: number, role: any): Promise<any>;
  deleteRole(roleId: number): Promise<any>;
  getRoles(limit: number, page: number): Promise<any>;
  getRoleByName(name: string): Promise<any>;
}

class RoleRepository implements IRoleRepository {
  async createRole(role: RoleValidationSchema): Promise<any> {
    const roleCreated = await Role.create(role as RoleValidationSchema);
    return roleCreated;
  }

  async getRoles(limit: number, page: number): Promise<any> {
    return Role.findAndCountAll({
      limit,
      offset: (page - 1) * limit,
    });
  }
  async getRoleById(roleId: number): Promise<any> {
    return await Role.findByPk(roleId);
  }
  async updateRole(roleId: number, role: any): Promise<any> {
    return await Role.update(role, { where: { id: roleId } });
  }
  async deleteRole(roleId: number): Promise<any> {
    return await Role.destroy({ where: { id: roleId } });
  }

  async getRoleByName(name: string): Promise<any> {
    return await Role.findOne({ where: { name } });
  }
}

export const roleRepository: IRoleRepository = new RoleRepository();
