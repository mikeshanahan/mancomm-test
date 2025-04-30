/* 
A lambda that runs on a schedule (once an hour) to ensure that all interpretation links have been scraped and put into the database
*/

// Import crawler config first to ensure storage directory is set before any Crawlee imports
import '../utils/crawlee/crawler-config';

import { MongoClient } from '../vendors/mongodb/mongo-client';
import { OshaInterpretationsService } from '../contexts/osha-interpretations/osha-interpretations';
import { OshaInterpretationsSyncService } from '../contexts/osha-interpretations/sync-interpretations';
import { Settings } from '../config/settings';

export const handler = async (event: any, _: any): Promise<any> => {
    // Connect to MongoDB
    const mongoClient = MongoClient.getInstance();
    await mongoClient.connect(Settings.mongo.uri, Settings.mongo.dbName);
    
    // Create services and run sync
    const interpretationsService = new OshaInterpretationsService();
    const syncService = new OshaInterpretationsSyncService(interpretationsService);
    
    // Set a limit to avoid timeouts (AWS Lambda has a 15-minute timeout)
    const maxInterpretations = process.env.MAX_INTERPRETATIONS ? parseInt(process.env.MAX_INTERPRETATIONS) : 100;
    const result = await syncService.syncInterpretations(maxInterpretations);
    
    // Close mongo connection
    await MongoClient.getInstance().disconnect();

    console.log('Sync completed successfully:', result);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'OSHA interpretations sync completed successfully',
        result
      })
    };
};
