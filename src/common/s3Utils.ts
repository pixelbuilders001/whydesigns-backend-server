import { v4 as uuidv4 } from "uuid";

export const generateS3Path = (
  module: string,
  username: string,
  fileName: string
): string => {
  // Replace any invalid characters in username
  const sanitizedUsername = username.replace(/[^a-zA-Z0-9]/g, "_");
  // Extract file extension
  const fileExtension = fileName.split(".").pop();
  // Generate a unique identifier for the file
  const uniqueId = uuidv4();

  return `${module}/${sanitizedUsername}/${uniqueId}${
    fileExtension ? `.${fileExtension}` : ""
  }`;
};
