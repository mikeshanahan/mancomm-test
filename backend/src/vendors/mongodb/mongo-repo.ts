import { Collection, ObjectId, Filter, UpdateFilter, OptionalUnlessRequiredId, FindOptions } from 'mongodb';
import { MongoClient } from './mongo-client';
import { MongoDocument, MongoQuery, MongoTextSearchQuery, MongoUpdateOptions } from './mongo-types';

export class MongoRepository<T extends MongoDocument> {
  protected collection: Collection<T>;
  
  constructor(protected collectionName: string) {
    const mongoClient = MongoClient.getInstance();
    this.collection = mongoClient.getCollection<T>(collectionName);
  }

  // Create operations
  async create(data: Partial<T>): Promise<T> {
    const now = new Date();
    const document = {
      ...data,
      _id: new ObjectId().toString(),
      createdAt: now,
      updatedAt: now
    } as unknown as OptionalUnlessRequiredId<T>;
    
    await this.collection.insertOne(document);
    return document as T;
  }

  async createMany(dataArray: Partial<T>[]): Promise<T[]> {
    const now = new Date();
    const documents = dataArray.map(data => ({
      ...data,
      _id: new ObjectId().toString(),
      createdAt: now,
      updatedAt: now
    })) as unknown as OptionalUnlessRequiredId<T>[];
    
    await this.collection.insertMany(documents);
    return documents as T[];
  }

  // Read operations
  async findById(id: string): Promise<T | null> {
    return this.collection.findOne({ _id: id } as Filter<T>) as Promise<T | null>;
  }

  async findOne(filter: Filter<T>): Promise<T | null> {
    return this.collection.findOne(filter) as Promise<T | null>;
  }

  async find(query: MongoQuery<T> = {}): Promise<T[]> {
    const { filter = {}, sort, limit, skip, options = {} } = query;
    
    let cursor = this.collection.find(filter, options as FindOptions<T>);
    
    if (sort) {
      cursor = cursor.sort(sort);
    }
    
    if (skip) {
      cursor = cursor.skip(skip);
    }
    
    if (limit) {
      cursor = cursor.limit(limit);
    }
    
    return cursor.toArray() as Promise<T[]>;
  }

  async count(filter: Filter<T> = {}): Promise<number> {
    return this.collection.countDocuments(filter);
  }

  // Text search operations
  async textSearch(query: MongoTextSearchQuery<T>): Promise<T[]> {
    const { text, filter = {}, sort, limit, skip, options = {} } = query;
    
    const searchFilter = {
      ...filter,
      $text: { $search: text }
    } as Filter<T>;
    
    let cursor = this.collection.find(searchFilter, {
      ...options,
      projection: { score: { $meta: 'textScore' } }
    } as FindOptions<T>);
    
    // Default sort by text score if no sort is provided
    const textSort = sort || { score: { $meta: 'textScore' } };
    cursor = cursor.sort(textSort);
    
    if (skip) {
      cursor = cursor.skip(skip);
    }
    
    if (limit) {
      cursor = cursor.limit(limit);
    }
    
    return cursor.toArray() as Promise<T[]>;
  }

  // Update operations
  async updateById(id: string, update: Partial<T>, options: MongoUpdateOptions = {}): Promise<T | null> {
    const updateData = {
      $set: {
        ...update,
        updatedAt: new Date()
      }
    } as UpdateFilter<T>;
    
    const result = await this.collection.findOneAndUpdate(
      { _id: id } as Filter<T>,
      updateData,
      { returnDocument: 'after', ...options }
    );
    
    return result as unknown as T | null;
  }


  // Delete operations
  async deleteById(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id } as Filter<T>);
    return result.deletedCount === 1;
  }

}
