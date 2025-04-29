"use strict";
/*
This module handles the scraping action for OSHA interpretations. It has methods for traversing the links
from the base interpretation page here: https://www.osha.gov/laws-regs/standardinterpretations/publicationdate

From this you get an array of urls which are then checked against the database
Any link not present will be scraped and stored in the database for searching
*/
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
exports.OshaInterpretationsService = void 0;
const repository_1 = require("./repository");
const html_fetcher_1 = require("../../utils/crawlee/html-fetcher");
const extractor_1 = require("../../utils/content-extractor/extractor");
const selectors_1 = require("./selectors");
class OshaInterpretationsService {
    constructor(extractorConfig) {
        this.repo = new repository_1.OshaInterpretationsRepo();
        this.extractorConfig = extractorConfig || {
            selectors: selectors_1.DEFAULT_SELECTORS,
            patterns: selectors_1.DEFAULT_PATTERNS
        };
    }
    /**
     * Scrape interpretations from the base URL
     */
    scrapeInterpretations(baseUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            // Collect all interpretation links into a single array
            const allLinks = [];
            try {
                // First level: Get year links from the base page
                const yearLinks = yield this.getYearLinks(baseUrl);
                console.log(`Found ${yearLinks.length} year links`);
                // Second level: For each year, get interpretation links
                for (const yearLink of yearLinks) {
                    try {
                        console.log(`Processing year link: ${yearLink}`);
                        const interpretationLinks = yield this.getInterpretationLinks(yearLink);
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
        });
    }
    /**
     * Get year links from the base page
     */
    getYearLinks(baseUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, html_fetcher_1.fetchHtml)(baseUrl);
            if (!result.success) {
                throw new Error(`Failed to fetch base URL: ${baseUrl}`);
            }
            const $ = require('cheerio').load(result.html);
            const yearLinks = [];
            // Extract year links from the page
            $('ul li a').each((_, element) => {
                const href = $(element).attr('href');
                const text = $(element).text().trim();
                // Check if the link text is a year (4 digits)
                if (href && text.match(/^\d{4}$/)) {
                    // Convert relative URLs to absolute URLs
                    const absoluteUrl = new URL(href, baseUrl).href;
                    yearLinks.push(absoluteUrl);
                }
            });
            return yearLinks;
        });
    }
    /**
     * Get interpretation links from a year page
     */
    getInterpretationLinks(yearUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, html_fetcher_1.fetchHtml)(yearUrl);
            if (!result.success) {
                throw new Error(`Failed to fetch year URL: ${yearUrl}`);
            }
            const $ = require('cheerio').load(result.html);
            const interpretationLinks = [];
            // Extract interpretation links from the page
            $('div.view-content a').each((_, element) => {
                const href = $(element).attr('href');
                if (href) {
                    // Convert relative URLs to absolute URLs
                    const absoluteUrl = new URL(href, yearUrl).href;
                    interpretationLinks.push(absoluteUrl);
                }
            });
            return interpretationLinks;
        });
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
            const text = $('body').text().trim();
            const patternResults = (0, extractor_1.extractFromText)(text, this.extractorConfig.patterns);
            for (const result of patternResults) {
                if (result.success) {
                    extracted[result.name] = result.value;
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
        const contentText = typeof extracted.content === 'string' ? extracted.content : '';
        const questions = Array.isArray(extracted.questions) ? extracted.questions : [];
        const documentDate = this.parseDate(extracted.date);
        return {
            url,
            scrapedDate: new Date(),
            documentDate,
            content: contentText,
            questions,
            images: Array.isArray(extracted.images) ? extracted.images : [],
            standardNumberLinks: Array.isArray(extracted.standardRefs) ? extracted.standardRefs : [],
            metadata: {
                title: typeof extracted.title === 'string' ? extracted.title : '',
                standardNumbers: Array.isArray(extracted.standardNumbers) ? extracted.standardNumbers : []
            },
            successful: true,
            errors: []
        };
    }
    /**
     * Scrape a single interpretation by URL
     */
    scrapeInterpretationByUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if already exists
                const existing = yield this.repo.existsByUrl(url);
                if (existing) {
                    return {
                        url,
                        successful: true,
                        errors: ['Already scraped']
                    };
                }
                // Fetch the page
                const fetchResult = yield (0, html_fetcher_1.fetchHtml)(url);
                if (!fetchResult.success) {
                    return {
                        url,
                        successful: false,
                        errors: [fetchResult.error || 'Failed to fetch URL']
                    };
                }
                // Extract content
                const $ = require('cheerio').load(fetchResult.html);
                const extracted = this.extractPageContent($);
                // Create interpretation object
                const interpretation = this.createInterpretation(url, extracted);
                // Save to database
                yield this.repo.saveInterpretation(interpretation);
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
        });
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
    saveScrapeResults(results) {
        return __awaiter(this, void 0, void 0, function* () {
            const successfulResults = results.filter(result => result.successful);
            console.log(`Saving ${successfulResults.length} successful results out of ${results.length} total`);
            for (const result of successfulResults) {
                try {
                    if (yield this.repo.existsByUrl(result.url)) {
                        console.log(`Skipping ${result.url} - already exists`);
                        continue;
                    }
                    yield this.scrapeInterpretationByUrl(result.url);
                }
                catch (error) {
                    console.error(`Failed to save result for ${result.url}:`, error);
                }
            }
        });
    }
}
exports.OshaInterpretationsService = OshaInterpretationsService;
