"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
require('dotenv').config();
const { OshaInterpretationsService } = require('../shared/contexts/osha-interpretations/osha-interpretations');
const { MongoClient } = require('../shared/vendors/mongodb/mongo-client');
function testSingleInterpretation() {
    return __awaiter(this, void 0, void 0, function* () {
        // Initialize MongoDB client
        const mongoClient = MongoClient.getInstance();
        yield mongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017', process.env.MONGODB_NAME || 'oshaDb');
        // Test URL
        const url = 'https://www.osha.gov/laws-regs/standardinterpretations/2025-02-05';
        console.log(`Testing scraping of interpretation: ${url}`);
        try {
            // Create an instance of OshaInterpretationsService
            const interpretationsService = new OshaInterpretationsService();
            // Use the service to scrape the interpretation
            console.log('Scraping interpretation...');
            const result = yield interpretationsService.scrapeInterpretationByUrl(url);
            if (result.successful) {
                console.log('Successfully scraped the interpretation');
                console.log('Result:', result);
            }
            else {
                console.error('Failed to scrape interpretation:', result.errors);
            }
            // The scrapeInterpretationByUrl method already checks if the URL exists in the database
            // and saves it if it doesn't, so we don't need to do that manually
            // Get the repository to check if the interpretation was saved
            const repo = interpretationsService.getRepository();
            const savedInterpretation = yield repo.findOne({ url });
            if (savedInterpretation) {
                console.log('\u2705 Interpretation was successfully saved to the database');
                console.log('Saved interpretation details:', {
                    url: savedInterpretation.url,
                    documentDate: savedInterpretation.documentDate,
                    questions: savedInterpretation.questions,
                    contentLength: savedInterpretation.content.length,
                    imagesCount: savedInterpretation.images.length
                });
            }
            else {
                console.log('\u274C Interpretation was not saved to the database');
            }
        }
        catch (error) {
            console.error('Error during scraping test:', error);
        }
    });
}
// Run the test
testSingleInterpretation();
