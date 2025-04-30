/* 
App configuration file - improvement would be to pull from parameter store instead of relying only on environment variables
*/


export const Settings = {
  /**
   * MongoDB settings
   */
  mongo: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://mike:DPFU2BrqYp8ElpZv@manncomm-test.zmgkpv3.mongodb.net/?retryWrites=true&w=majority&appName=manncomm-test',
    dbName: process.env.MONGODB_NAME || 'mancomm',
  },
  
  /**
   * Crawlee settings
   */
  crawlee: {
    osha: {
      baseUrl: 'https://www.osha.gov/laws-regs/standardinterpretations/publicationdate',
      linksBaseUrl: 'https://www.osha.gov',
      maxConcurrency: 5,
      maxRequestsPerCrawl: 50,
      includePatterns: [
        'https://www.osha.gov/laws-regs/standardinterpretations/*'
      ],
      excludePatterns: [
        '*search*',
        '*index*',
        '*archive*'
      ]
    }
  },
  
  /**
   * API settings
   */
  api: {
    testUserId: process.env.TEST_USER_ID || 'test-user-123',
    jwtSecret: process.env.JWT_SECRET || 'development-secret-key',
  }
};
