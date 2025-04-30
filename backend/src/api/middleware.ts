/* 
API middleware to determine user is authenticated.
Verifies JWT tokens and extracts user information
This is essentially a mock where we only expect a single 'user' to exist
*/

import jwt from 'jsonwebtoken';
import { Settings } from '../config/settings';
import { ParsedRequest } from './deserializer';

export interface DecodedToken {
  sub: string;  // User ID
  iat?: number; // Issued at timestamp
  exp?: number; // Expiration timestamp
}

export interface AuthenticatedRequest extends ParsedRequest {
  user?: {
    id: string;
  };
}

export const authenticate = (request: ParsedRequest): AuthenticatedRequest => {
  const authRequest = request as AuthenticatedRequest;
  const authHeader = request.headers?.Authorization || request.headers?.authorization;

  if (!authHeader) {
    throw {
      statusCode: 403,
      body: JSON.stringify({ error: 'Forbidden - Missing authentication token' })
    };
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : authHeader;

  // Would normally confirm the user exists to allow the request to continue but for now we will just mock a user
  try {
    const decoded = jwt.verify(token, Settings.api.jwtSecret) as DecodedToken;
    if (decoded.sub === Settings.api.testUserId) {
      authRequest.user = {
        id: decoded.sub
      };
      return authRequest;
    } else {
      throw new Error('Invalid user ID');
    }
  } catch (error) {
    console.error('Token verification failed:', error);
    throw {
      statusCode: 403,
      body: JSON.stringify({ error: 'Forbidden - Invalid authentication token' })
    };
  }
};