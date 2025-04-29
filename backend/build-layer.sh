#!/bin/bash

# Script to build the Lambda layer

# Set variables
LAYER_DIR="shared-layer/nodejs/node_modules"
SHARED_DIR="shared"

# Clean existing layer directory
rm -rf "$LAYER_DIR/shared"

# Copy shared directory to layer
cp -r "$SHARED_DIR" "$LAYER_DIR/"

# Install dependencies in the layer
cd "$LAYER_DIR/shared" && npm install --production

echo "Lambda layer built successfully"
