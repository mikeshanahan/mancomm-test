// API response types

// Generic API response interface
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Base MongoDB document interface
export interface MongoDocument {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interpretation interface
export interface OshaInterpretation extends MongoDocument {
  url: string;
  documentDate?: string;
  title: string;
  content: string;
  images: string[];
  standardNumberLinks: string[];
  metadata?: Record<string, any>;
  successful: boolean;
  errors: string[];
}

// Paginated response interface
export interface PaginatedResponse {
  results: OshaInterpretation[];
  total: number;
}
