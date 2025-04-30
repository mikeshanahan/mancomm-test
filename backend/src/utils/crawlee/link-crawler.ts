import { CheerioCrawler, RequestQueue } from 'crawlee';
import { getStorageDirectory } from './crawler-config';

/**
 * Result from crawling a URL and its links
 */
export interface CrawlResult {
  baseUrl: string;
  pageResults: PageResult[];
  crawledUrls: string[];
}

/**
 * Result from a single page
 */
export interface PageResult {
  url: string;
  html: string;
  links: string[];
  success: boolean;
  error?: string;
}

/**
 * Options for crawling
 */
export interface CrawlOptions {
  maxConcurrency?: number;
  maxPages?: number;
  includePatterns?: string[];
  excludePatterns?: string[];
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * Crawls a base URL and its links, returning the HTML content of each page
 */
export async function crawlLinks(
  baseUrl: string,
  options: CrawlOptions = {}
): Promise<CrawlResult> {
  const {
    maxConcurrency = 5,
    maxPages = 50,
    includePatterns = [],
    excludePatterns = [],
    timeout = 30000,
    headers
  } = options;
  
  const pageResults: PageResult[] = [];
  const crawledUrls: string[] = [];
  
  // Create request queue with appropriate storage directory
  const requestQueue = await RequestQueue.open(getStorageDirectory());
  await requestQueue.addRequest({ url: baseUrl });
  
  // Create crawler
  const crawler = new CheerioCrawler({
    requestQueue,
    maxConcurrency,
    maxRequestsPerCrawl: maxPages,
    requestHandlerTimeoutSecs: Math.ceil(timeout / 1000),
    preNavigationHooks: headers ? [
      async (context) => {
        context.request.headers = { ...context.request.headers, ...headers };
      }
    ] : undefined,
    
    // Process each page
    async requestHandler({ request, $, body, enqueueLinks }) {
      const url = request.url;
      crawledUrls.push(url);
      
      if (!$ || !body) {
        pageResults.push({
          url,
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
      
      // Add page result
      pageResults.push({
        url,
        html: htmlContent,
        links,
        success: true
      });
      
      // Enqueue links
      await enqueueLinks({
        globs: includePatterns.length > 0 ? includePatterns : undefined,
        exclude: excludePatterns.length > 0 ? excludePatterns : undefined,
      });
    }
  });
  
  await crawler.run();
  
  return {
    baseUrl,
    pageResults,
    crawledUrls
  };
}

/**
 * Crawls a base URL and processes each page with a callback function
 */
export async function crawlAndProcess(
  baseUrl: string,
  processPage: (page: PageResult) => Promise<void>,
  options: CrawlOptions = {}
): Promise<string[]> {
  const {
    maxConcurrency = 5,
    maxPages = 50,
    includePatterns = [],
    excludePatterns = [],
    timeout = 30000,
    headers
  } = options;
  
  const crawledUrls: string[] = [];
  
  // Create request queue with appropriate storage directory
  const requestQueue = await RequestQueue.open(getStorageDirectory());
  await requestQueue.addRequest({ url: baseUrl });
  
  // Create crawler
  const crawler = new CheerioCrawler({
    requestQueue,
    maxConcurrency,
    maxRequestsPerCrawl: maxPages,
    requestHandlerTimeoutSecs: Math.ceil(timeout / 1000),
    preNavigationHooks: headers ? [
      async (context) => {
        context.request.headers = { ...context.request.headers, ...headers };
      }
    ] : undefined,
    
    // Process each page
    async requestHandler({ request, $, body, enqueueLinks }) {
      const url = request.url;
      crawledUrls.push(url);
      
      if (!$ || !body) {
        await processPage({
          url,
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
      
      // Process the page
      await processPage({
        url,
        html: htmlContent,
        links,
        success: true
      });
      
      // Enqueue links
      await enqueueLinks({
        globs: includePatterns.length > 0 ? includePatterns : undefined,
        exclude: excludePatterns.length > 0 ? excludePatterns : undefined,
      });
    }
  });
  
  await crawler.run();
  return crawledUrls;
}
