"use strict";
/*
A lambda that runs on a schedule (once an hour) to ensure that all interpretation links have been scraped and put into the database
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const mongo_client_1 = require("../vendors/mongodb/mongo-client");
const osha_interpretations_1 = require("../contexts/osha-interpretations/osha-interpretations");
const sync_interpretations_1 = require("../contexts/osha-interpretations/sync-interpretations");
const handler = async (event, _) => {
    try {
        // Connect to MongoDB
        const mongoClient = mongo_client_1.MongoClient.getInstance();
        await mongoClient.connect(process.env.MONGODB_URI || '', process.env.MONGODB_NAME || 'mancomm');
        // Create services and run sync
        const interpretationsService = new osha_interpretations_1.OshaInterpretationsService();
        const syncService = new sync_interpretations_1.OshaInterpretationsSyncService(interpretationsService);
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
    }
    catch (error) {
        console.error('Error during sync operation:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error during OSHA interpretations sync',
                error: error instanceof Error ? error.message : String(error)
            })
        };
    }
    finally {
        // Close MongoDB connection
        await mongo_client_1.MongoClient.getInstance().disconnect();
    }
};
exports.handler = handler;
