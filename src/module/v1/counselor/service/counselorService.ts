import { AlreadyExistsError, NotFoundError } from "../../../../error";
import { validatePayloadSchema } from "../../../../utils/zod";
import { ICounselorRepository } from "../repository/counselorRepository";
import {
  CounselorSchema,
  CounselorUpdateSchema,
  CounselorFilterSchema,
  CounselorValidation,
  CounselorUpdateValidation,
} from "./validation";

export default class CounselorService {
  private counselorRepository: ICounselorRepository;

  constructor(counselorRepository: ICounselorRepository) {
    this.counselorRepository = counselorRepository;
  }

  async create(payload: CounselorValidation) {
    const data = validatePayloadSchema(CounselorSchema, payload);
    // Could add uniqueness constraints later (e.g., name+title)
    const created = await this.counselorRepository.create(data as any);
    return created;
  }

  async update(id: number, payload: CounselorUpdateValidation) {
    const counselor = await this.counselorRepository.getById(id);
    if (!counselor) throw new NotFoundError("Counselor not found");

    const data = validatePayloadSchema(CounselorUpdateSchema, payload);
    const updated = await this.counselorRepository.update(id, data as any);
    return updated;
  }

  async getById(id: number) {
    const counselor = await this.counselorRepository.getById(id);
    if (!counselor) throw new NotFoundError("Counselor not found");
    return counselor;
  }

  async list(limit: number, page: number, filterQuery: any) {
    const filter = validatePayloadSchema(CounselorFilterSchema, filterQuery);
    return this.counselorRepository.list(limit, page, filter as any);
  }

  async delete(id: number) {
    const deleted = await this.counselorRepository.delete(id);
    if (!deleted) throw new NotFoundError("Counselor not found");
    return deleted;
  }
}
