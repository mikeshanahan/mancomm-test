"use strict";
/*
This module handles the synchronization of OSHA interpretations.
It traverses the initial page and all year pages to collect interpretation links,
then concurrently scrapes and stores any interpretations that don't exist in the database.
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
exports.OshaInterpretationsSyncService = void 0;
const utils_1 = require("../../utils/utils");
class OshaInterpretationsSyncService {
    constructor(service, baseUrl = 'https://www.osha.gov/laws-regs/standardinterpretations/publicationdate', concurrencyLimit = 5) {
        this.service = service;
        this.baseUrl = baseUrl;
        this.concurrencyLimit = concurrencyLimit;
    }
    /**
     * Synchronize OSHA interpretations by scraping new ones
     */
    syncInterpretations() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Starting OSHA interpretations sync...');
            // Get all links by traversing years
            const allLinks = yield this.getAllInterpretationLinks();
            console.log(`Found ${allLinks.length} total interpretation links`);
            // Get existing URLs from database
            const existingUrls = yield this.service.getRepository().getAllUrls();
            console.log(`Found ${existingUrls.length} existing interpretations in database`);
            // Filter out links that already exist in the database
            const newLinks = allLinks.filter(url => !existingUrls.includes(url));
            console.log(`Found ${newLinks.length} new interpretation links to scrape`);
            if (newLinks.length === 0) {
                return { total: allLinks.length, new: 0, errors: 0 };
            }
            // Scrape new links concurrently
            const results = yield this.scrapeLinksWithConcurrency(newLinks);
            // Count errors
            const errors = results.filter(result => !result.successful).length;
            // Save results to database
            yield this.service.saveScrapeResults(results);
            return {
                total: allLinks.length,
                new: newLinks.length,
                errors
            };
        });
    }
    /**
     * Get all interpretation links by traversing years
     */
    getAllInterpretationLinks() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // This will traverse the base URL, get year links, and then get interpretation links
                return yield this.service.scrapeInterpretations(this.baseUrl);
            }
            catch (error) {
                console.error('Error getting interpretation links:', error);
                return [];
            }
        });
    }
    /**
     * Scrape links with concurrency limit
     */
    scrapeLinksWithConcurrency(links) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            const chunks = (0, utils_1.chunkArray)(links, this.concurrencyLimit);
            for (const chunk of chunks) {
                const chunkPromises = chunk.map(url => this.service.scrapeInterpretationByUrl(url));
                const chunkResults = yield Promise.all(chunkPromises);
                results.push(...chunkResults);
                // Log progress
                console.log(`Processed ${results.length}/${links.length} links`);
            }
            return results;
        });
    }
}
exports.OshaInterpretationsSyncService = OshaInterpretationsSyncService;
