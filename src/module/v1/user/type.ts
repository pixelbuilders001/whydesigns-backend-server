export type UserResponse = {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  email: string;
  password: string;
  phoneNumber: string;
  address?: string;
  profilePicture?: string;
  biography?: string;
  isActive: boolean;
  refreshToken?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};
