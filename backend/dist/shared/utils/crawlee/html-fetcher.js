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
exports.fetchHtml = fetchHtml;
exports.fetchMultipleHtml = fetchMultipleHtml;
const crawlee_1 = require("crawlee");
/**
 * Fetches HTML content from a single URL
 */
function fetchHtml(url_1) {
    return __awaiter(this, arguments, void 0, function* (url, options = {}) {
        try {
            const { maxConcurrency = 1, timeout = 30000, headers } = options;
            let result = {
                url,
                html: '',
                links: [],
                success: false
            };
            // Create request queue
            const requestQueue = yield crawlee_1.RequestQueue.open();
            yield requestQueue.addRequest({ url });
            // Create crawler
            const crawler = new crawlee_1.CheerioCrawler({
                requestQueue,
                maxConcurrency,
                requestHandlerTimeoutSecs: Math.ceil(timeout / 1000),
                preNavigationHooks: headers ? [
                    (context) => __awaiter(this, void 0, void 0, function* () {
                        context.request.headers = Object.assign(Object.assign({}, context.request.headers), headers);
                    })
                ] : undefined,
                // Process the page
                requestHandler(_a) {
                    return __awaiter(this, arguments, void 0, function* ({ request, $, body }) {
                        if (!$ || !body) {
                            throw new Error('Failed to load content');
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
                        result = {
                            url: request.url,
                            html: htmlContent,
                            links,
                            success: true
                        };
                    });
                }
            });
            yield crawler.run();
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
    });
}
/**
 * Fetches HTML content from multiple URLs
 */
function fetchMultipleHtml(urls_1) {
    return __awaiter(this, arguments, void 0, function* (urls, options = {}) {
        try {
            const { maxConcurrency = 2, timeout = 30000, headers } = options;
            const results = [];
            // Create request queue
            const requestQueue = yield crawlee_1.RequestQueue.open();
            yield requestQueue.addRequests(urls.map(url => ({ url })));
            // Create crawler
            const crawler = new crawlee_1.CheerioCrawler({
                requestQueue,
                maxConcurrency,
                requestHandlerTimeoutSecs: Math.ceil(timeout / 1000),
                preNavigationHooks: headers ? [
                    (context) => __awaiter(this, void 0, void 0, function* () {
                        context.request.headers = Object.assign(Object.assign({}, context.request.headers), headers);
                    })
                ] : undefined,
                // Process each page
                requestHandler(_a) {
                    return __awaiter(this, arguments, void 0, function* ({ request, $, body }) {
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
                    });
                }
            });
            yield crawler.run();
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
    });
}
