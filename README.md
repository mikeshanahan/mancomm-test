# mancomm-test
Web scraper Lambda function with API Gateway integration using Crawlee.

## Architecture
- AWS Lambda function with API Gateway proxy integration
- Crawlee for web scraping
- Lambda Layer for shared utilities
- Serverless Application Model (SAM) template

## Deployment

```bash
# Install dependencies
npm install --prefix backend/src
npm install --prefix backend/shared

# Package Lambda Layer
mkdir -p backend/shared/nodejs
cp -r backend/shared/node_modules backend/shared/nodejs/

# Deploy with SAM
sam build
sam deploy --guided
```

## API Usage

Endpoint: `https://{api-id}.execute-api.{region}.amazonaws.com/{stage}/`

Parameters:
- `url`: The URL to scrape (required)
- `selector`: CSS selector to extract specific elements (optional)

Example:
```
https://{api-id}.execute-api.{region}.amazonaws.com/{stage}/?url=https://example.com&selector=h1
```
