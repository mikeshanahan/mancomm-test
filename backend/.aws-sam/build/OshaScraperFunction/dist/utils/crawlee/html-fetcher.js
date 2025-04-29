"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchHtml = fetchHtml;
exports.fetchMultipleHtml = fetchMultipleHtml;
const crawlee_1 = require("crawlee");
/**
 * Fetches HTML content from a single URL
 */
async function fetchHtml(url, options = {}) {
    try {
        const { maxConcurrency = 1, timeout = 30000, headers } = options;
        let result = {
            url,
            html: '',
            links: [],
            success: false
        };
        // Create request queue
        const requestQueue = await crawlee_1.RequestQueue.open();
        await requestQueue.addRequest({ url });
        // Create crawler
        const crawler = new crawlee_1.CheerioCrawler({
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
                const links = [];
                $('a[href]').each((_, el) => {
                    const href = $(el).attr('href');
                    if (href)
                        links.push(href);
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
    }
    catch (error) {
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
async function fetchMultipleHtml(urls, options = {}) {
    try {
        const { maxConcurrency = 2, timeout = 30000, headers } = options;
        const results = [];
        // Create request queue
        const requestQueue = await crawlee_1.RequestQueue.open();
        await requestQueue.addRequests(urls.map(url => ({ url })));
        // Create crawler
        const crawler = new crawlee_1.CheerioCrawler({
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
                const links = [];
                $('a[href]').each((_, el) => {
                    const href = $(el).attr('href');
                    if (href)
                        links.push(href);
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
    }
    catch (error) {
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
