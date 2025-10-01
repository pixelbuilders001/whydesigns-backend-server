import MailService from "../adapters/mail/MailService";
import { roleRepository } from "../module/v1/role/repository/roleRepostory";
import RoleService from "../module/v1/role/service/roleService";
import { userRepository } from "../module/v1/user/repository/userRepository";
import UserService from "../module/v1/user/service/userService";
import StorageFactory from "./StorageFactory";
import ImageService from "../module/v1/image/service/imageService";
import { otpRepository } from "../module/v1/otp/repository/otpRepository";
import { counselorRepository } from "../module/v1/counselor/repository/counselorRepository";
import CounselorService from "../module/v1/counselor/service/counselorService";
import { bookingRepository } from "../module/v1/booking/repository/bookingRepository";
import BookingService from "../module/v1/booking/service/bookingService";

// User Service
export const userService = new UserService(
  userRepository,
  roleRepository,
  otpRepository,
  MailService,
  StorageFactory.getStorageAdapter()
);

// Role Service
export const roleService = new RoleService(roleRepository);

// Image Service
export const imageService = new ImageService(
  StorageFactory.getStorageAdapter()
);

// Counselor Service
export const counselorService = new CounselorService(counselorRepository);

// Booking Service
export const bookingService = new BookingService(bookingRepository);
