import { MongoDocument } from '../../vendors/mongodb/mongo-types';

export interface OshaInterpretation extends MongoDocument {
  url: string;
  documentDate?: Date;

  title: string;
  content: string;
  images: string[];
  standardNumberLinks: string[];

  metadata?: Record<string, any>;  // Unused but placeholder for future useful metadata
  successful: boolean;
  errors: string[];
}

export interface ScrapingResult {
  url: string;
  successful: boolean;
  errors: string[];
}