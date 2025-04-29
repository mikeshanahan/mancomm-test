require('dotenv').config();
const { OshaInterpretationsService } = require('../shared/contexts/osha-interpretations/osha-interpretations.ts');
const { OshaInterpretationsSyncService } = require('../shared/contexts/osha-interpretations/sync-interpretations.ts');
const { MongoClient } = require('../shared/vendors/mongodb/mongo-client');

async function testSyncInterpretations() {
  const mongoClient = MongoClient.getInstance();
  await mongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017', process.env.MONGODB_NAME || 'oshaDb');

  try {
    // Create the services
    const interpretationsService = new OshaInterpretationsService();
    const syncService = new OshaInterpretationsSyncService(interpretationsService);
    // Set a limit for testing
    const maxInterpretations = 3000;
    
    console.log(`Starting sync operation with limit of ${maxInterpretations} interpretations...`);
    try {
      const results = await syncService.syncInterpretations(maxInterpretations);
      
      // Display results
      console.log('Sync operation completed.');
      console.log(`Total interpretations processed: ${results.length}`);
      console.log(`Successful: ${results.filter(r => r.successful).length}`);
      console.log(`Failed: ${results.filter(r => !r.successful).length}`);
      
      // Show any errors
      const failedResults = results.filter(r => !r.successful);
      if (failedResults.length > 0) {
        console.log('\nFailed interpretations:');
        failedResults.forEach(result => {
          console.log(`- ${result.url}: ${result.errors.join(', ')}`);
        });
      }
      
      // Get stats from the database
      const repo = interpretationsService.getRepository();
      const count = await repo.count({});
      console.log(`\nTotal interpretations in database: ${count}`);
    } catch (error) {
      console.error('Error during sync operation:', error);
    }
    
  } catch (error) {
    console.error('Error during sync operation:', error);
  }
}

// Run the test
testSyncInterpretations()
