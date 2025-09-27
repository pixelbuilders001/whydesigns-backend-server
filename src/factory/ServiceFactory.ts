import MailService from "../adapters/mail/MailService";
import { roleRepository } from "../module/v1/role/repository/roleRepostory";
import RoleService from "../module/v1/role/service/roleService";
import { userRepository } from "../module/v1/user/repository/userRepository";
import UserService from "../module/v1/user/service/userService";
import CacheFactory from "./CacheFactory";
import StorageFactory from "./StorageFactory";
import ImageService from "../module/v1/image/service/imageService";

// User Service
export const userService = new UserService(
  userRepository,
  roleRepository,
  CacheFactory.getCacheAdapter(),
  MailService,
  StorageFactory.getStorageAdapter()
);

// Role Service
export const roleService = new RoleService(roleRepository);

// Image Service
export const imageService = new ImageService(
  StorageFactory.getStorageAdapter()
);
