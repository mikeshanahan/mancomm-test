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
  
  /**
   * Check if an interpretation with the given URL already exists
   */
  async existsByUrl(url: string): Promise<boolean> {
    const count = await this.collection.countDocuments({ url, successful: true });
    return count > 0;
  }
  
  /**
   * Get all URLs that have been scraped
   */
  async getAllUrls(): Promise<string[]> {
    const docs = await this.collection.find({}, { projection: { url: 1 } }).toArray();
    return docs.map(doc => doc.url);
  }
  
  /**
   * Save an interpretation to the database
   */
  async saveInterpretation(interpretation: Omit<OshaInterpretation, '_id'>): Promise<OshaInterpretation> {
    return this.create(interpretation);
  }
}
