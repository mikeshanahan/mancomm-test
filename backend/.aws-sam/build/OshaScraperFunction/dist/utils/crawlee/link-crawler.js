"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crawlLinks = crawlLinks;
exports.crawlAndProcess = crawlAndProcess;
const crawlee_1 = require("crawlee");
/**
 * Crawls a base URL and its links, returning the HTML content of each page
 */
async function crawlLinks(baseUrl, options = {}) {
    const { maxConcurrency = 5, maxPages = 50, includePatterns = [], excludePatterns = [], timeout = 30000, headers } = options;
    const pageResults = [];
    const crawledUrls = [];
    // Create request queue
    const requestQueue = await crawlee_1.RequestQueue.open();
    await requestQueue.addRequest({ url: baseUrl });
    // Create crawler
    const crawler = new crawlee_1.CheerioCrawler({
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
            const links = [];
            $('a[href]').each((_, el) => {
                const href = $(el).attr('href');
                if (href)
                    links.push(href);
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
async function crawlAndProcess(baseUrl, processPage, options = {}) {
    const { maxConcurrency = 5, maxPages = 50, includePatterns = [], excludePatterns = [], timeout = 30000, headers } = options;
    const crawledUrls = [];
    // Create request queue
    const requestQueue = await crawlee_1.RequestQueue.open();
    await requestQueue.addRequest({ url: baseUrl });
    // Create crawler
    const crawler = new crawlee_1.CheerioCrawler({
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
            const links = [];
            $('a[href]').each((_, el) => {
                const href = $(el).attr('href');
                if (href)
                    links.push(href);
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
