/* 
Methods for searching and retrieving OSHA interpretations processed from scraper
*/
import { OshaInterpretationsRepo } from '../../contexts/osha-interpretations/repository';
import { ParsedRequest } from '../deserializer';

export class OshaInterpretationsApi {
    private repo: OshaInterpretationsRepo;

    constructor() {
        this.repo = new OshaInterpretationsRepo();
    }
    
    public async handleRequest(request: ParsedRequest): Promise<{statusCode: number; body: string; headers?: Record<string, string>}> {
        const { path, method, queryParameters } = request;
        
        if (method === 'GET') {
            // Handle single interpretation by ID
            if (path.match(/\/interpretations\/[a-zA-Z0-9]+$/)) {
                return this.handleGetById(path);
            }
            
            // Handle search
            return this.handleSearch(queryParameters);
        }
        
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    
    private async handleGetById(path: string): Promise<{statusCode: number; body: string}> {
        const id = path.split('/').pop() || '';
        const interpretation = await this.repo.findById(id);
        
        if (!interpretation) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Interpretation not found' })
            };
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify(interpretation)
        };
    }
    
    private async handleSearch(queryParameters: Record<string, string>): Promise<{statusCode: number; body: string}> {
        const query = queryParameters.query || '';
        const page = parseInt(queryParameters.page || '1', 10);
        const limit = parseInt(queryParameters.limit || '20', 10);
        const sort = queryParameters.sort || 'date';
        const sortDirection = queryParameters.sortDirection || 'desc';
        
        const results = await this.repo.searchInterpretations(query, page, limit, sort, sortDirection);
        return {
            statusCode: 200,
            body: JSON.stringify(results)
        };
    }
}