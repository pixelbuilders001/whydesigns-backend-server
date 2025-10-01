import Booking from '../../../../../db/models/booking/booking.model';
import { Op } from 'sequelize';

export interface BookingFilter {
  userId?: number;
  counselorId?: number;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface IBookingRepository {
  create(data: Partial<Booking>): Promise<any>;
  update(id: number, data: Partial<Booking>): Promise<any>;
  delete(id: number): Promise<number>;
  getById(id: number): Promise<any>;
  list(limit: number, page: number, filter?: BookingFilter): Promise<{ rows: any[]; count: number }>;
  findByUserAndDate(userId: number, sessionDate: Date): Promise<any>;
  findByCounselorAndDate(counselorId: number, sessionDate: Date): Promise<any>;
  findUpcomingBookings(counselorId?: number, userId?: number): Promise<any[]>;
  findBookingsInDateRange(counselorId: number, startDate: Date, endDate: Date): Promise<any[]>;
}

class BookingRepository implements IBookingRepository {
  async create(data: Partial<Booking>): Promise<any> {
    return Booking.create(data as any);
  }

  async update(id: number, data: Partial<Booking>): Promise<any> {
    await Booking.update(data, { where: { id } });
    return this.getById(id);
  }

  async delete(id: number): Promise<number> {
    return Booking.destroy({ where: { id } });
  }

  async getById(id: number): Promise<any> {
    return Booking.findByPk(id, {
      include: [
        {
          model: Booking.sequelize!.models.User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: Booking.sequelize!.models.Counselor,
          as: 'counselor',
          attributes: ['id', 'fullName', 'title', 'avatarUrl'],
        },
      ],
    });
  }

  async list(limit: number, page: number, filter: BookingFilter = {}) {
    const where: any = {};

    if (filter.userId) {
      where.userid = filter.userId;
    }

    if (filter.counselorId) {
      where.counselorid = filter.counselorId;
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.startDate || filter.endDate) {
      where.sessionDate = {};
      if (filter.startDate) {
        where.sessionDate[Op.gte] = filter.startDate;
      }
      if (filter.endDate) {
        where.sessionDate[Op.lte] = filter.endDate;
      }
    }

    if (filter.search) {
      where[Op.or] = [
        { '$user.firstName$': { [Op.iLike]: `%${filter.search}%` } },
        { '$user.lastName$': { [Op.iLike]: `%${filter.search}%` } },
        { '$counselor.fullName$': { [Op.iLike]: `%${filter.search}%` } },
        { notes: { [Op.iLike]: `%${filter.search}%` } },
      ];
    }

    return Booking.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['sessionDate', 'DESC'], ['createdAt', 'DESC']],
      include: [
        {
          model: Booking.sequelize!.models.User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: Booking.sequelize!.models.Counselor,
          as: 'counselor',
          attributes: ['id', 'fullName', 'title', 'avatarUrl'],
        },
      ],
    });
  }

  async findByUserAndDate(userId: number, sessionDate: Date): Promise<any> {
    return Booking.findOne({
      where: {
        userId: userId,
        sessionDate: sessionDate,
      },
    });
  }

  async findByCounselorAndDate(counselorId: number, sessionDate: Date): Promise<any> {
    return Booking.findOne({
      where: {
        counselorId: counselorId,
        sessionDate: sessionDate,
      },
    });
  }

  async findUpcomingBookings(counselorId?: number, userId?: number): Promise<any[]> {
    const where: any = {
      sessionDate: {
        [Op.gte]: new Date(),
      },
      status: {
        [Op.in]: ['pending', 'confirmed'],
      },
    };

    if (counselorId) {
      where.counselorId = counselorId;
    }

    if (userId) {
      where.userId = userId;
    }

    return Booking.findAll({
      where,
      order: [['sessionDate', 'ASC']],
      include: [
        {
          model: Booking.sequelize!.models.User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: Booking.sequelize!.models.Counselor,
          as: 'counselor',
          attributes: ['id', 'fullName', 'title', 'avatarUrl'],
        },
      ],
    });
  }

  async findBookingsInDateRange(counselorId: number, startDate: Date, endDate: Date): Promise<any[]> {
    return Booking.findAll({
      where: {
        counselorId: counselorId,
        sessionDate: {
          [Op.between]: [startDate, endDate],
        },
      },
      order: [['sessionDate', 'ASC']],
    });
  }
}

export const bookingRepository: IBookingRepository = new BookingRepository();
