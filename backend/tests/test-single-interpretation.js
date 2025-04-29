require('dotenv').config();
const { OshaInterpretationsService } = require('../shared/contexts/osha-interpretations/osha-interpretations');
const { MongoClient } = require('../shared/vendors/mongodb/mongo-client');

async function testSingleInterpretation() {
  // Setup db connection
  const mongoClient = MongoClient.getInstance();
  await mongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017', process.env.MONGODB_NAME || 'oshaDb');

  const url = 'https://www.osha.gov/laws-regs/standardinterpretations/2024-07-16';
  
  try {
    const interpretationsService = new OshaInterpretationsService();
    const result = await interpretationsService.scrapeInterpretationByUrl(url);
    
    if (result.successful) {
      console.log('Successfully scraped the interpretation');
      console.log('Result:', result);
    } else {
      console.error('Failed to scrape interpretation:', result.errors);
    }
    
    const repo = interpretationsService.getRepository();
    const savedInterpretation = await repo.findOne({ url });
    
    if (savedInterpretation) {
      console.log('Interpretation was successfully saved to the database');
      console.log('Saved interpretation details:', {
        url: savedInterpretation.url,
        documentDate: savedInterpretation.documentDate,
        questions: savedInterpretation.questions,
        contentLength: savedInterpretation.content.length,
        imagesCount: savedInterpretation.images.length
      });
    } else {
      console.log('Interpretation was not saved to the database');
    }
  } catch (error) {
    console.error('Error during scraping test:', error);
  }
}

testSingleInterpretation();
