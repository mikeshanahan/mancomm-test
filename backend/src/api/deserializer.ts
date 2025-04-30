/**
 * Interface representing a parsed API Gateway request
 */
export interface ParsedRequest {
  path: string;
  pathParameters: Record<string, string>;
  queryParameters: Record<string, string>;
  method: string;
  body: any;
  headers?: Record<string, string>;
}
  
/**
 * Deserializes the API Gateway event into path and query parameters
 */
export const deserializeRequest = (event: any): ParsedRequest => {
  const path = event.path || '/';
  const method = event.httpMethod || 'GET';
  
  // Extract path parameters
  const pathParameters = event.pathParameters || {};
  
  // Extract query parameters
  const queryParameters = event.queryStringParameters || {};
  
  // Extract headers
  const headers = event.headers || {};
  
  // Parse body if it exists
  let body = null;
  if (event.body) {
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      body = event.body;
    }
  }
  
  return {
    path,
    pathParameters,
    queryParameters,
    method,
    body,
    headers
  };
};
  

// CORS headers for all responses
export const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};
