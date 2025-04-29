"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractFromContext = extractFromContext;
exports.createContentProcessor = createContentProcessor;
exports.extractSelectors = extractSelectors;
exports.extractPatterns = extractPatterns;
const extractor_1 = require("../content-extractor/extractor");
/**
 * Extracts content from a Crawlee context using a configuration
 */
function extractFromContext(context, config) {
    try {
        const { request, $ } = context;
        if (!$) {
            return {
                url: request.url,
                content: {},
                success: false,
                error: 'No Cheerio instance available'
            };
        }
        // Extract content using the configuration
        const content = (0, extractor_1.extractContent)($, config);
        return {
            url: request.url,
            content,
            success: true
        };
    }
    catch (error) {
        return {
            url: context.request.url,
            content: {},
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}
/**
 * Creates a content processor function for use with Crawlee
 */
function createContentProcessor(config) {
    return (context) => extractFromContext(context, config);
}
/**
 * Extracts specific selectors from a Crawlee context
 */
function extractSelectors(context, selectors) {
    const { $ } = context;
    if (!$)
        return [];
    return (0, extractor_1.extractFromHtml)($, selectors);
}
/**
 * Extracts text patterns from a Crawlee context
 */
function extractPatterns(context, patterns) {
    const { $ } = context;
    if (!$)
        return [];
    const text = $('body').text().trim();
    return (0, extractor_1.extractFromText)(text, patterns);
}
