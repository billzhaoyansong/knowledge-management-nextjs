// Custom error classes for Strapi service

export class StrapiError extends Error {
  public readonly status?: number;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(message: string, status?: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'StrapiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class StrapiConnectionError extends StrapiError {
  constructor(message: string = 'Failed to connect to Strapi server') {
    super(message, undefined, 'CONNECTION_ERROR');
    this.name = 'StrapiConnectionError';
  }
}

export class StrapiAuthenticationError extends StrapiError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'StrapiAuthenticationError';
  }
}

export class StrapiNotFoundError extends StrapiError {
  constructor(resource: string, identifier: string) {
    super(`${resource} with identifier '${identifier}' not found`, 404, 'NOT_FOUND');
    this.name = 'StrapiNotFoundError';
  }
}

export class StrapiValidationError extends StrapiError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'StrapiValidationError';
  }
}

export class StrapiTimeoutError extends StrapiError {
  constructor(timeout: number) {
    super(`Request timed out after ${timeout}ms`, undefined, 'TIMEOUT_ERROR');
    this.name = 'StrapiTimeoutError';
  }
}

// Type guard functions
export const isStrapiError = (error: unknown): error is StrapiError => {
  return error instanceof StrapiError;
};

export const isStrapiConnectionError = (error: unknown): error is StrapiConnectionError => {
  return error instanceof StrapiConnectionError;
};

export const isStrapiAuthenticationError = (error: unknown): error is StrapiAuthenticationError => {
  return error instanceof StrapiAuthenticationError;
};

export const isStrapiNotFoundError = (error: unknown): error is StrapiNotFoundError => {
  return error instanceof StrapiNotFoundError;
};

export const isStrapiValidationError = (error: unknown): error is StrapiValidationError => {
  return error instanceof StrapiValidationError;
};

export const isStrapiTimeoutError = (error: unknown): error is StrapiTimeoutError => {
  return error instanceof StrapiTimeoutError;
};

// Error handling utilities
export const handleStrapiError = (error: unknown): StrapiError => {
  if (isStrapiError(error)) {
    return error;
  }

  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as any;
    const status = axiosError.response?.status;
    const message = axiosError.response?.data?.error?.message || axiosError.message;
    const details = axiosError.response?.data?.error?.details;

    if (status === 401) {
      return new StrapiAuthenticationError(message);
    }
    
    if (status === 404) {
      return new StrapiNotFoundError('Resource', 'unknown');
    }

    if (status === 400) {
      return new StrapiValidationError(message, details);
    }

    return new StrapiError(message, status, 'HTTP_ERROR', details);
  }

  if (error && typeof error === 'object' && 'code' in error) {
    const nodeError = error as any;
    
    if (nodeError.code === 'ECONNREFUSED' || nodeError.code === 'ENOTFOUND') {
      return new StrapiConnectionError(`Connection failed: ${nodeError.message}`);
    }

    if (nodeError.code === 'ECONNABORTED') {
      return new StrapiTimeoutError(5000); // Default timeout
    }
  }

  const message = error instanceof Error ? error.message : 'Unknown error occurred';
  return new StrapiError(message, undefined, 'UNKNOWN_ERROR');
};