/**
 * Crawlee configuration utilities to handle local and lambda deployed environments
 */

import { Configuration } from 'crawlee';

// Immediately set global storage directory before any other imports
if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
  Configuration.getGlobalConfig().set('storageDir' as any, '/tmp/crawlee-storage');
} else {
  Configuration.getGlobalConfig().set('storageDir' as any, './storage');
}

export function getStorageDirectory(uniqueId?: string): string | undefined {
  // Check if running in AWS Lambda environment
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return uniqueId ? `/tmp/crawlee-storage-${uniqueId}` : '/tmp/crawlee-storage';
  }
  
  // Return unique directory for non-Lambda environments to avoid lock conflicts
  return uniqueId ? `./storage-${uniqueId}` : './storage';
}
