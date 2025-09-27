export const generateS3Path = (
  module: string,
  username: string,
  fileName: string
): string => {
  // Replace any invalid characters in username
  const sanitizedUsername = username.replace(/[^a-zA-Z0-9]/g, "_");
  // Extract file extension
  const fileExtension = fileName.split(".").pop();
  // Generate a unique identifier for the file without uuid package
  const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return `${module}/${sanitizedUsername}/${uniqueId}${
    fileExtension ? `.${fileExtension}` : ""
  }`;
};
