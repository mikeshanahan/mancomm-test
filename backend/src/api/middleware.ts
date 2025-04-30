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
    return authRequest;
  }
  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : authHeader;
  
  try {
    const decoded = jwt.verify(token, Settings.api.jwtSecret) as DecodedToken;
    if (decoded.sub === Settings.api.testUserId) {
      authRequest.user = {
        id: decoded.sub
      };
    }
  } catch (error) {
    console.error('Token verification failed:', error);
  }
  
  return authRequest;
};