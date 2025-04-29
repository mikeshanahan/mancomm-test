/* 
A lambda that runs on a schedule (once an hour) to ensure that all interpretation links have been scraped and put into the database
*/

import { MongoClient } from '../vendors/mongodb/mongo-client';
import { OshaInterpretationsService } from '../contexts/osha-interpretations/osha-interpretations';
import { OshaInterpretationsSyncService } from '../contexts/osha-interpretations/sync-interpretations';

export const handler = async (event: any, _: any): Promise<any> => {
  try {
    // Connect to MongoDB
    const mongoClient = MongoClient.getInstance();
    await mongoClient.connect(process.env.MONGODB_URI || '', process.env.MONGODB_NAME || 'mancomm');
    
    // Create services and run sync
    const interpretationsService = new OshaInterpretationsService();
    const syncService = new OshaInterpretationsSyncService(interpretationsService);
    
    // Set a limit to avoid timeouts (AWS Lambda has a 15-minute timeout)
    const maxInterpretations = process.env.MAX_INTERPRETATIONS ? parseInt(process.env.MAX_INTERPRETATIONS) : 100;
    const result = await syncService.syncInterpretations(maxInterpretations);

    console.log('Sync completed successfully:', result);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'OSHA interpretations sync completed successfully',
        result
      })
    };
  } catch (error) {
    console.error('Error during sync operation:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error during OSHA interpretations sync',
        error: error instanceof Error ? error.message : String(error)
      })
    };
  } finally {
    // Close MongoDB connection
    await MongoClient.getInstance().disconnect();
  }
};
