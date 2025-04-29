"use strict";
/*
This module handles the scraping action for OSHA interpretations. It has methods for traversing the links
from the base interpretation page here: https://www.osha.gov/laws-regs/standardinterpretations/publicationdate

From this you get an array of urls which are then checked against the database
Any link not present will be scraped and stored in the database for searching
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.OshaInterpretationsService = void 0;
const repository_1 = require("./repository");
const html_fetcher_1 = require("../../utils/crawlee/html-fetcher");
const cheerio_helper_1 = require("../../utils/cheerio/cheerio-helper");
const extractor_1 = require("../../utils/content-extractor/extractor");
const selectors_1 = require("./selectors");
const config_1 = require("../../config");
class OshaInterpretationsService {
    constructor(extractorConfig) {
        this.repo = new repository_1.OshaInterpretationsRepo();
        this.extractorConfig = extractorConfig || {
            selectors: selectors_1.DEFAULT_SELECTORS
        };
    }
    /**
     * Scrape interpretations from the base URL
     */
    async scrapeInterpretations(baseUrl) {
        // Collect all interpretation links into a single array
        const allLinks = [];
        try {
            // First level: Get year links from the base page
            const yearLinks = await this.getYearLinks(baseUrl);
            console.log(`Found ${yearLinks.length} year links`);
            // Second level: For each year, get interpretation links
            for (const yearLink of yearLinks) {
                try {
                    console.log(`Processing year link: ${yearLink}`);
                    const interpretationLinks = await this.getInterpretationLinks(yearLink);
                    console.log(`Found ${interpretationLinks.length} interpretation links for ${yearLink}`);
                    allLinks.push(...interpretationLinks);
                }
                catch (error) {
                    console.error(`Error getting links for ${yearLink}:`, error);
                }
            }
        }
        catch (error) {
            console.error('Error collecting interpretation links:', error);
        }
        return allLinks;
    }
    /**
     * Get year links from the base page
     */
    async getYearLinks(baseUrl) {
        const result = await (0, html_fetcher_1.fetchHtml)(baseUrl);
        if (!result.success) {
            throw new Error(`Failed to fetch base URL: ${baseUrl}`);
        }
        const $ = (0, cheerio_helper_1.loadCheerio)(result.html);
        const yearLinks = [];
        // Extract year links from the page
        $('ul li a').each((_, element) => {
            const href = (0, cheerio_helper_1.extractAttribute)($(element), 'href');
            const text = (0, cheerio_helper_1.extractText)($(element));
            // Check if the link text is a year (4 digits)
            if (href && text.match(/^\d{4}$/)) {
                // Convert relative URLs to absolute URLs
                const absoluteUrl = new URL(href, baseUrl).href;
                yearLinks.push(absoluteUrl);
            }
        });
        return yearLinks;
    }
    /**
     * Get interpretation links from a year page
     */
    async getInterpretationLinks(yearUrl) {
        const result = await (0, html_fetcher_1.fetchHtml)(yearUrl);
        if (!result.success) {
            throw new Error(`Failed to fetch year page: ${yearUrl}`);
        }
        const $ = (0, cheerio_helper_1.loadCheerio)(result.html);
        const interpretationLinks = [];
        // Extract interpretation links from the page
        $('div.view-content a').each((_, element) => {
            const href = (0, cheerio_helper_1.extractAttribute)($(element), 'href');
            if (href) {
                // Convert relative URLs to absolute URLs
                const absoluteUrl = new URL(href, yearUrl).href;
                interpretationLinks.push(absoluteUrl);
            }
        });
        return interpretationLinks;
    }
    /**
     * Extract content from a page using selectors and patterns
     */
    extractPageContent($) {
        const extracted = {};
        // Extract from selectors
        if (this.extractorConfig.selectors) {
            const selectorResults = (0, extractor_1.extractFromHtml)($, this.extractorConfig.selectors);
            for (const result of selectorResults) {
                if (result.success) {
                    extracted[result.name] = result.value;
                }
            }
        }
        // Extract from patterns
        if (this.extractorConfig.patterns) {
            // Check if we have content to run patterns on
            if (extracted.content) {
                const patternResults = (0, extractor_1.extractFromText)(extracted.content, this.extractorConfig.patterns);
                for (const result of patternResults) {
                    if (result.success) {
                        extracted[result.name] = result.value;
                    }
                }
            }
        }
        return extracted;
    }
    /**
     * Parse date from extracted content
     */
    parseDate(dateString) {
        if (!dateString || typeof dateString !== 'string') {
            return undefined;
        }
        const dateMatch = dateString.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4}|\d{2})/);
        if (dateMatch) {
            const [_, month, day, year] = dateMatch;
            const fullYear = year.length === 2 ? `20${year}` : year;
            return new Date(`${fullYear}-${month}-${day}`);
        }
        return undefined;
    }
    /**
     * Create an interpretation object from extracted content
     */
    createInterpretation(url, extracted) {
        // Throw error if required fields are missing
        if (!extracted.content) {
            throw new Error(`No content extracted for ${url}`);
        }
        if (!extracted.title) {
            throw new Error(`No title extracted for ${url}`);
        }
        const contentText = typeof extracted.content === 'string' ? extracted.content : '';
        const title = typeof extracted.title === 'string' ? extracted.title : '';
        return {
            url,
            documentDate: new Date(url.split('/').pop() || new Date().toISOString()),
            title,
            content: contentText,
            images: Array.isArray(extracted.images) ? extracted.images.map(img => new URL(img, config_1.Settings.crawlee.osha.linksBaseUrl).href) : [],
            standardNumberLinks: Array.isArray(extracted.standardNumberLinks) ? extracted.standardNumberLinks.map(link => new URL(link, config_1.Settings.crawlee.osha.linksBaseUrl).href) : [],
            successful: true,
            errors: []
        };
    }
    /**
     * Scrape a single interpretation by URL
     */
    async scrapeInterpretationByUrl(url) {
        try {
            // Check if db already has this url with a successful: true flag, if so skip
            const exists = await this.repo.existsByUrl(url);
            if (exists) {
                console.log(`Skipping ${url} - already exists in database`);
                return {
                    url,
                    successful: true,
                    errors: []
                };
            }
            // Fetch the page
            const fetchResult = await (0, html_fetcher_1.fetchHtml)(url);
            if (!fetchResult.success) {
                return {
                    url,
                    successful: false,
                    errors: [fetchResult.error || 'Failed to fetch URL']
                };
            }
            // Extract content
            const $ = (0, cheerio_helper_1.loadCheerio)(fetchResult.html);
            const extracted = this.extractPageContent($);
            // Create interpretation object
            const interpretation = this.createInterpretation(url, extracted);
            // Save to database
            await this.repo.saveInterpretation(interpretation);
            return {
                url,
                successful: true,
                errors: []
            };
        }
        catch (error) {
            return {
                url,
                successful: false,
                errors: [error instanceof Error ? error.message : String(error)]
            };
        }
    }
    /**
     * Get the repository instance
     */
    getRepository() {
        return this.repo;
    }
    /**
     * Update the extractor configuration
     */
    updateExtractorConfig(config) {
        this.extractorConfig = config;
    }
    /**
     * Save scrape results to the database
     */
    async saveScrapeResults(results) {
        const successfulResults = results.filter(result => result.successful);
        console.log(`Saving ${successfulResults.length} successful results out of ${results.length} total`);
        for (const result of successfulResults) {
            try {
                if (await this.repo.existsByUrl(result.url)) {
                    console.log(`Skipping ${result.url} - already exists`);
                    continue;
                }
                await this.scrapeInterpretationByUrl(result.url);
            }
            catch (error) {
                console.error(`Failed to save result for ${result.url}:`, error);
            }
        }
    }
}
exports.OshaInterpretationsService = OshaInterpretationsService;
