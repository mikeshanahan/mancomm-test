/* 
DB access class for the osha interpretations collection
*/

import { MongoRepository } from '../../vendors/mongodb/mongo-repo';
import { OshaInterpretation } from './types';
import { Collections } from '../../config';

export class OshaInterpretationsRepo extends MongoRepository<OshaInterpretation> {
  constructor() {
    super(Collections.OSHA_INTERPRETATIONS);
  }

  async existsByUrl(url: string): Promise<boolean> {
    const count = await this.collection.countDocuments({ url, successful: true });
    return count > 0;
  }

  async getAllUrls(): Promise<string[]> {
    const docs = await this.collection.find({ successful: true}, { projection: { url: 1 } }).toArray();
    return docs.map(doc => doc.url);
  }

  async saveInterpretation(interpretation: Omit<OshaInterpretation, '_id'>): Promise<OshaInterpretation> {
    return this.create(interpretation);
  }

  async searchInterpretations(query: string, page = 1, limit = 20, sort = 'date', sortDirection = 'desc'): Promise<{ results: OshaInterpretation[], total: number }> {
    // If query is empty, return all documents
    let filter: any = { successful: true };
    
    if (query) {
      // Only content uses text search, others use case-insensitive regex
      filter = {
        $and: [
          {
            $or: [
              { url: { $regex: query, $options: 'i' } },
              { title: { $regex: query, $options: 'i' } },
              { content: { $regex: query, $options: 'i' } },
              { standardNumberLinks: { $elemMatch: { $regex: query, $options: 'i' } } }
            ]
          },
          { successful: true }
        ]
      };
    }
    
    // Get total count first
    const total = await this.collection.countDocuments(filter);
    
    // Build sort object
    const sortObj: any = {};
    if (sort === 'date') {
      sortObj.documentDate = sortDirection === 'desc' ? -1 : 1;
    } else if (sort === 'title') {
      sortObj.title = sortDirection === 'desc' ? -1 : 1;
    }
    
    // Then get paginated results
    const skip = (page - 1) * limit;
    const docs = await this.collection.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .toArray();
    
    return { results: docs, total };
  }
}
