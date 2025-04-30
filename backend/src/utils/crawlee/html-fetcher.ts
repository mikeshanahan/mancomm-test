import { CheerioCrawler, RequestQueue } from 'crawlee';
import { getStorageDirectory } from './crawler-config';

/**
 * Result from fetching a URL
 */
export interface FetchResult {
  url: string;
  html: string;
  links: string[];
  success: boolean;
  error?: string;
}

/**
 * Options for fetching URLs
 */
export interface FetchOptions {
  maxConcurrency?: number;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * Fetches HTML content from a single URL
 */
export async function fetchHtml(url: string, options: FetchOptions = {}): Promise<FetchResult> {
  try {
    const { maxConcurrency = 1, timeout = 30000, headers } = options;
    
    let result: FetchResult = {
      url,
      html: '',
      links: [],
      success: false
    };
    
    // Create request queue with appropriate storage directory
    const requestQueue = await RequestQueue.open(getStorageDirectory());
    await requestQueue.addRequest({ url });
    
    // Create crawler
    const crawler = new CheerioCrawler({
      requestQueue,
      maxConcurrency,
      requestHandlerTimeoutSecs: Math.ceil(timeout / 1000),
      preNavigationHooks: headers ? [
        async (context) => {
          context.request.headers = { ...context.request.headers, ...headers };
        }
      ] : undefined,
      
      // Process the page
      async requestHandler({ request, $, body }) {
        if (!$ || !body) {
          throw new Error('Failed to load content');
        }
        
        // Convert body to string if it's a Buffer
        const htmlContent = typeof body === 'string' ? body : body.toString('utf-8');

        const links: string[] = [];
        $('a[href]').each((_, el) => {
          const href = $(el).attr('href');
          if (href) links.push(href);
        });
        result = {
          url: request.url,
          html: htmlContent,
          links,
          success: true
        };
      }
    });
    
    await crawler.run();
    return result;
  } catch (error) {
    return {
      url,
      html: '',
      links: [],
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Fetches HTML content from multiple URLs
 */
export async function fetchMultipleHtml(
  urls: string[],
  options: FetchOptions = {}
): Promise<FetchResult[]> {
  try {
    const { maxConcurrency = 2, timeout = 30000, headers } = options;
    
    const results: FetchResult[] = [];
    
    // Create request queue with appropriate storage directory
    const requestQueue = await RequestQueue.open(getStorageDirectory());
    await requestQueue.addRequests(urls.map(url => ({ url })));
    
    // Create crawler
    const crawler = new CheerioCrawler({
      requestQueue,
      maxConcurrency,
      requestHandlerTimeoutSecs: Math.ceil(timeout / 1000),
      preNavigationHooks: headers ? [
        async (context) => {
          context.request.headers = { ...context.request.headers, ...headers };
        }
      ] : undefined,
      
      // Process each page
      async requestHandler({ request, $, body }) {
        if (!$ || !body) {
          results.push({
            url: request.url,
            html: '',
            links: [],
            success: false,
            error: 'Failed to load content'
          });
          return;
        }
        
        // Convert body to string if it's a Buffer
        const htmlContent = typeof body === 'string' ? body : body.toString('utf-8');
        
        // Extract links
        const links: string[] = [];
        $('a[href]').each((_, el) => {
          const href = $(el).attr('href');
          if (href) links.push(href);
        });
        
        results.push({
          url: request.url,
          html: htmlContent,
          links,
          success: true
        });
      }
    });
    
    await crawler.run();
    return results;
  } catch (error) {
    console.error('Error fetching multiple URLs:', error);
    return urls.map(url => ({
      url,
      html: '',
      links: [],
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }));
  }
}
