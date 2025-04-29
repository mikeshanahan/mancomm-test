/* 
A lambda that runs on a schedule (once an hour) to ensure that all interpretation links have been scraped and put into the database
*/

// Dynamic imports for Lambda compatibility 
const getImports = () => {
  try {
    // Check if we're running in Lambda
    require.resolve('/opt/nodejs/node_modules/shared');
    // Lambda path
    return {
      MongoClient: require('/opt/nodejs/node_modules/shared/vendors/mongodb/mongo-client').MongoClient,
      OshaInterpretationsService: require('/opt/nodejs/node_modules/shared/contexts/osha-interpretations/osha-interpretations').OshaInterpretationsService,
      OshaInterpretationsSyncService: require('/opt/nodejs/node_modules/shared/contexts/osha-interpretations/sync-interpretations').OshaInterpretationsSyncService
    };
  } catch (e) {
    // Local path
    return {
      MongoClient: require('./shared/vendors/mongodb/mongo-client').MongoClient,
      OshaInterpretationsService: require('./shared/contexts/osha-interpretations/osha-interpretations').OshaInterpretationsService,
      OshaInterpretationsSyncService: require('./shared/contexts/osha-interpretations/sync-interpretations').OshaInterpretationsSyncService
    };
  }
};

const { MongoClient, OshaInterpretationsService, OshaInterpretationsSyncService } = getImports();

export const handler = async (event, _): Promise<any> => {
  try {
    // Connect to MongoDB
    const mongoClient = MongoClient.getInstance();
    await mongoClient.connect(process.env.MONGODB_URI, process.env.MONGODB_NAME);
    
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
        error: error.message
      })
    };
  } finally {
    // Close MongoDB connection
    await MongoClient.getInstance().disconnect();
  }
};
