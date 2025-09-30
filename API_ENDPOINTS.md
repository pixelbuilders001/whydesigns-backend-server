# API Endpoints Reference

Base URL: `/api/v1`

## Table of Contents
- [Authentication](#authentication)
- [Users](#users)
- [Roles](#roles)
- [Counselors](#counselors)
- [Images](#images)

## Authentication

### Sign Up
- **URL**: `/user/signup`
- **Method**: `POST`
- **Request Body**:
  ```typescript
  {
    firstName: string;          // min 2 chars, optional
    lastName: string;           // min 2 chars, optional
    dateOfBirth?: Date;         // optional
    email: string;              // valid email format
    password: string;           // min 6 chars, optional if empty string
    phoneNumber?: string;       // 10-15 digits, optional
    address?: string;           // max 200 chars, optional
    profilePicture?: string;    // URL, optional
  }
  ```

### Sign In
- **URL**: `/user/signin`
- **Method**: `POST`
- **Request Body**:
  ```typescript
  {
    emailOrPhoneNumber: string;  // Must be valid email or 10-digit phone number
    password: string;            // min 6 chars
  }
  ```

### Refresh Token
- **URL**: `/user/refresh-token`
- **Method**: `POST`
- **Headers**:
  - `Authorization: Bearer <refresh_token>`

### Reset Password
- **URL**: `/user/reset-password`
- **Method**: `POST`
- **Request Body**:
  ```typescript
  {
    email: string;      // valid email format
    password: string;   // min 6 chars
    otp: string;        // OTP code (length from config)
  }
  ```

## Users

### Get All Users
- **URL**: `/user/all-users`
- **Method**: `GET`
- **Query Parameters**:
  ```typescript
  {
    email?: string;        // Filter by email
    phoneNumber?: string;  // 10-15 digits
    firstName?: string;    // min 2 chars
    isActive?: boolean;
    roleId?: number;
    page?: number;         // Default: 1
    limit?: number;        // Default: 10
  }
  ```

### Get Current User
- **URL**: `/user/me`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <access_token>`

### Get User by ID
- **URL**: `/user/:id`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <access_token>`

### Update User
- **URL**: `/user/:id`
- **Method**: `PUT`
- **Headers**:
  - `Authorization: Bearer <access_token>`
- **Request Body**:
  ```typescript
  {
    firstName?: string;      // min 2 chars
    lastName?: string;       // min 2 chars
    dateOfBirth?: Date;
    address?: string;        // max 200 chars
    profilePicture?: string; // URL
  }
  ```

## Roles

### Create Role
- **URL**: `/role`
- **Method**: `POST`
- **Headers**:
  - `Authorization: Bearer <access_token>`
- **Request Body**:
  ```typescript
  {
    name: string;           // required
    description?: string;
  }
  ```

### Get All Roles
- **URL**: `/role`
- **Method**: `GET`
- **Query Parameters**:
  ```typescript
  {
    page?: number;    // Default: 1
    limit?: number;   // Default: 10
  }
  ```

### Get Role by ID
- **URL**: `/role/:id`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <access_token>`

### Update Role
- **URL**: `/role/:id`
- **Method**: `PUT`
- **Headers**:
  - `Authorization: Bearer <access_token>`
- **Request Body**:
  ```typescript
  {
    name?: string;
    description?: string;
  }
  ```

### Delete Role
- **URL**: `/role/:id`
- **Method**: `DELETE`
- **Headers**:
  - `Authorization: Bearer <access_token>`

## Counselors

### Create Counselor
- **URL**: `/counselor`
- **Method**: `POST`
- **Headers**:
  - `Authorization: Bearer <access_token>`
- **Request Body**:
  ```typescript
  {
    fullName: string;           // min 2 chars
    title?: string;             // min 2 chars
    yearsOfExperience?: number; // 0-80, integer
    bio?: string;               // max 5000 chars
    avatarUrl?: string;         // URL
    specialties?: string[];     // array of non-empty strings
    isActive?: boolean;         // default: true
    rating?: number;            // 0-5
  }
  ```

### Get All Counselors
- **URL**: `/counselor`
- **Method**: `GET`
- **Query Parameters**:
  ```typescript
  {
    search?: string;    // Search in fullName or bio
    isActive?: boolean; // Filter by active status
    page?: number;      // Default: 1
    limit?: number;     // Default: 10
  }
  ```

### Get Counselor by ID
- **URL**: `/counselor/:id`
- **Method**: `GET`

### Update Counselor
- **URL**: `/counselor/:id`
- **Method**: `PUT`
- **Headers**:
  - `Authorization: Bearer <access_token>`
- **Request Body**: Same as Create Counselor, all fields optional

### Delete Counselor
- **URL**: `/counselor/:id`
- **Method**: `DELETE`
- **Headers**:
  - `Authorization: Bearer <access_token>`

## Images

### Upload Image
- **URL**: `/image/:module/upload`
- **Method**: `POST`
- **Headers**:
  - `Authorization: Bearer <access_token>`
  - `Content-Type: multipart/form-data`
- **Form Data**:
  - `file`: The image file to upload

### Delete Image
- **URL**: `/image/:module`
- **Method**: `DELETE`
- **Headers**:
  - `Authorization: Bearer <access_token>`
- **Request Body**:
  ```typescript
  {
    fileUrl: string;  // URL of the image to delete
  }
  ```

## Health Check

### API Health
- **URL**: `/health`
- **Method**: `GET`
- **Response**:
  ```typescript
  {
    message: string;  // e.g., "API is up and running."
  }
  ```
