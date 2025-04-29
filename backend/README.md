# OSHA Interpretations Scraper

An AWS SAM application that scrapes OSHA interpretation documents and stores them in MongoDB. The application runs on a scheduled basis to keep the database up-to-date with the latest interpretations.

## Architecture

- **Lambda Layer**: Contains shared code in `/shared` directory
- **Scraper Lambda**: Runs hourly to scrape and sync OSHA interpretations
- **MongoDB**: Stores the scraped interpretations

## Deployment

### Prerequisites

- AWS SAM CLI installed
- AWS credentials configured
- MongoDB connection string stored in SSM Parameter Store at `/mancomm/mongodb/uri`

### Build and Deploy

1. Build the Lambda layer:
   ```
   ./build-layer.sh
   ```

2. Deploy with SAM:
   ```
   ./deploy.sh
   ```
   Or use the SAM CLI directly:
   ```
   sam build
   sam deploy
   ```

## Configuration

The following parameters can be configured in `samconfig.toml` or during deployment:

- `Stage`: Deployment stage (default: dev)
- `MongoDbUri`: MongoDB connection URI
- `MongoDbName`: MongoDB database name (default: mancomm)
- `MaxInterpretations`: Maximum number of interpretations to process per run (default: 100)

## Local Development

1. Start MongoDB locally:
   ```
   docker compose up -d
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the scraper locally:
   ```
   node -r ts-node/register lambdas/scraper/main.ts
   ```
