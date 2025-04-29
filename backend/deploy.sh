#!/bin/bash

# Build the Lambda layer
./build-layer.sh

# Package the SAM application
sam package \
  --template-file template.yml \
  --output-template-file packaged.yml \
  --s3-bucket your-deployment-bucket

# Deploy the SAM application
sam deploy \
  --template-file packaged.yml \
  --stack-name osha-interpretations-scraper \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    Stage=dev \
    MongoDbUri="your-mongodb-uri" \
    MongoDbName=mancomm \
    MaxInterpretations=100
