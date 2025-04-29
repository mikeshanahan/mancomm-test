import { Document, Filter, Sort, FindOptions, UpdateFilter, IndexSpecification, WithId } from 'mongodb';

export interface MongoDocument {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MongoQuery<T extends MongoDocument> {
  filter?: Filter<T>;
  sort?: Sort;
  limit?: number;
  skip?: number;
  options?: FindOptions<T>;
}

export interface MongoTextSearchQuery<T extends MongoDocument> extends MongoQuery<T> {
  text: string;
  fields?: string[];
}

export interface MongoUpdateOptions {
  upsert?: boolean;
}

export interface MongoIndexOptions {
  unique?: boolean;
  sparse?: boolean;
  background?: boolean;
  expireAfterSeconds?: number;
}
