"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crawlLinks = crawlLinks;
exports.crawlAndProcess = crawlAndProcess;
const crawlee_1 = require("crawlee");
/**
 * Crawls a base URL and its links, returning the HTML content of each page
 */
function crawlLinks(baseUrl_1) {
    return __awaiter(this, arguments, void 0, function* (baseUrl, options = {}) {
        const { maxConcurrency = 5, maxPages = 50, includePatterns = [], excludePatterns = [], timeout = 30000, headers } = options;
        const pageResults = [];
        const crawledUrls = [];
        // Create request queue
        const requestQueue = yield crawlee_1.RequestQueue.open();
        yield requestQueue.addRequest({ url: baseUrl });
        // Create crawler
        const crawler = new crawlee_1.CheerioCrawler({
            requestQueue,
            maxConcurrency,
            maxRequestsPerCrawl: maxPages,
            requestHandlerTimeoutSecs: Math.ceil(timeout / 1000),
            preNavigationHooks: headers ? [
                (context) => __awaiter(this, void 0, void 0, function* () {
                    context.request.headers = Object.assign(Object.assign({}, context.request.headers), headers);
                })
            ] : undefined,
            // Process each page
            requestHandler(_a) {
                return __awaiter(this, arguments, void 0, function* ({ request, $, body, enqueueLinks }) {
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
                    yield enqueueLinks({
                        globs: includePatterns.length > 0 ? includePatterns : undefined,
                        exclude: excludePatterns.length > 0 ? excludePatterns : undefined,
                    });
                });
            }
        });
        yield crawler.run();
        return {
            baseUrl,
            pageResults,
            crawledUrls
        };
    });
}
/**
 * Crawls a base URL and processes each page with a callback function
 */
function crawlAndProcess(baseUrl_1, processPage_1) {
    return __awaiter(this, arguments, void 0, function* (baseUrl, processPage, options = {}) {
        const { maxConcurrency = 5, maxPages = 50, includePatterns = [], excludePatterns = [], timeout = 30000, headers } = options;
        const crawledUrls = [];
        // Create request queue
        const requestQueue = yield crawlee_1.RequestQueue.open();
        yield requestQueue.addRequest({ url: baseUrl });
        // Create crawler
        const crawler = new crawlee_1.CheerioCrawler({
            requestQueue,
            maxConcurrency,
            maxRequestsPerCrawl: maxPages,
            requestHandlerTimeoutSecs: Math.ceil(timeout / 1000),
            preNavigationHooks: headers ? [
                (context) => __awaiter(this, void 0, void 0, function* () {
                    context.request.headers = Object.assign(Object.assign({}, context.request.headers), headers);
                })
            ] : undefined,
            // Process each page
            requestHandler(_a) {
                return __awaiter(this, arguments, void 0, function* ({ request, $, body, enqueueLinks }) {
                    const url = request.url;
                    crawledUrls.push(url);
                    if (!$ || !body) {
                        yield processPage({
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
                    yield processPage({
                        url,
                        html: htmlContent,
                        links,
                        success: true
                    });
                    // Enqueue links
                    yield enqueueLinks({
                        globs: includePatterns.length > 0 ? includePatterns : undefined,
                        exclude: excludePatterns.length > 0 ? excludePatterns : undefined,
                    });
                });
            }
        });
        yield crawler.run();
        return crawledUrls;
    });
}
