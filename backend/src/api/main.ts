/* 
Main API router to determine namespace and router request to relevant api class
*/

import { ParsedRequest } from "./deserializer";
import { OshaInterpretationsApi } from "./contexts/osha-interpretations-api";
import { authenticate } from "./middleware";

export const router = async (request: ParsedRequest): Promise<{statusCode: number; body: string; headers?: Record<string, string>}> => {
    const { path } = request;
    
    if (path == '/health/check') {
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'OK' })
        };
    }
    
    try {
        authenticate(request);
        
        if (path.startsWith('/interpretations')) {
            const api = new OshaInterpretationsApi();
            return await api.handleRequest(request);
        }
        
        return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Not found' })
        };
    } catch (error) {
        if (error && typeof error === 'object' && 'statusCode' in error && 'body' in error) {
            return error as {statusCode: number; body: string};
        }
        
        console.error('Unhandled error in router:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
