/**
 * Parse error responses from backend API
 * Handles multiple error formats:
 * 1. { message, field } - field-specific error (409 Conflict)
 * 2. { message, errors: { field: [messages] } } - validation errors
 * 3. { message } - general error
 */

export interface ParsedError {
  mainMessage: string;
  fieldErrors: Record<string, string>;
}

export function parseApiError(error: any): ParsedError {
  const mainMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Terjadi kesalahan";

  const fieldErrors: Record<string, string> = {};

  // Format 1: { message, field } - Conflict error (409)
  if (error?.response?.data?.field) {
    const field = error.response.data.field;
    fieldErrors[field] = error.response.data.message || mainMessage;
  }

  // Format 2: { message, errors: { field: [messages] } } - Validation errors
  if (error?.response?.data?.errors && typeof error.response.data.errors === "object") {
    Object.entries(error.response.data.errors).forEach(([field, messages]: [string, any]) => {
      if (Array.isArray(messages)) {
        fieldErrors[field] = messages[0]; // Take first error message
      } else if (typeof messages === "string") {
        fieldErrors[field] = messages;
      }
    });
  }

  return {
    mainMessage,
    fieldErrors,
  };
}

export function getFieldError(fieldErrors: Record<string, string>, fieldName: string): string | null {
  return fieldErrors[fieldName] || null;
}
