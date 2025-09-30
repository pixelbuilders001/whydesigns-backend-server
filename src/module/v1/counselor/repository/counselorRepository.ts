import Counselor from '../../../../../db/models/counselor/counselor.model';
import { Op } from 'sequelize';

export interface CounselorFilter {
  search?: string;
  isActive?: boolean;
}

export interface ICounselorRepository {
  create(data: Partial<Counselor>): Promise<any>;
  update(id: number, data: Partial<Counselor>): Promise<any>;
  delete(id: number): Promise<number>;
  getById(id: number): Promise<any>;
  list(limit: number, page: number, filter?: CounselorFilter): Promise<{ rows: any[]; count: number }>;
}

class CounselorRepository implements ICounselorRepository {
  async create(data: Partial<Counselor>): Promise<any> {
    return Counselor.create(data as any);
  }

  async update(id: number, data: Partial<Counselor>): Promise<any> {
    await Counselor.update(data, { where: { id } });
    return this.getById(id);
  }

  async delete(id: number): Promise<number> {
    return Counselor.destroy({ where: { id } });
  }

  async getById(id: number): Promise<any> {
    return Counselor.findByPk(id);
  }

  async list(limit: number, page: number, filter: CounselorFilter = {}) {
    const where: any = {};

    if (typeof filter.isActive === 'boolean') {
      where.isActive = filter.isActive;
    }

    if (filter.search) {
      // simple ILIKE search against name/title
      where[Op.or] = [
        { fullName: { [Op.iLike]: `%${filter.search}%` } },
        { title: { [Op.iLike]: `%${filter.search}%` } },
      ];
    }

    return Counselor.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
    });
  }
}

export const counselorRepository: ICounselorRepository = new CounselorRepository();
