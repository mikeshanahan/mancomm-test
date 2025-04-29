/* 
This module handles the scraping action for OSHA interpretations. It has methods for traversing the links
from the base interpretation page here: https://www.osha.gov/laws-regs/standardinterpretations/publicationdate

From this you get an array of urls which are then checked against the database
Any link not present will be scraped and stored in the database for searching
*/

import { OshaInterpretation, ScrapingResult } from './types';
import { OshaInterpretationsRepo } from './repository';
import { fetchHtml } from '../../utils/crawlee/html-fetcher';
import { loadCheerio, extractText, extractAttribute } from '../../utils/cheerio/cheerio-helper';
import { extractFromHtml, extractFromText } from '../../utils/content-extractor/extractor';
import { ExtractorConfig } from '../../utils/content-extractor/selector-config';
import { DEFAULT_SELECTORS } from './selectors';
import * as cheerio from 'cheerio';
import { Settings } from '../../config';

export class OshaInterpretationsService {
  private repo: OshaInterpretationsRepo;
  private extractorConfig: ExtractorConfig;
  
  constructor(extractorConfig?: ExtractorConfig) {
    this.repo = new OshaInterpretationsRepo();
    this.extractorConfig = extractorConfig || {
      selectors: DEFAULT_SELECTORS
    };
  }
  
  /**
   * Scrape interpretations from the base URL
   */
  async scrapeInterpretations(baseUrl: string): Promise<string[]> {
    // Collect all interpretation links into a single array
    const allLinks: string[] = [];
    
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
        } catch (error) {
          console.error(`Error getting links for ${yearLink}:`, error);
        }
      }
    } catch (error) {
      console.error('Error collecting interpretation links:', error);
    }
    
    return allLinks;
  }
  
  /**
   * Get year links from the base page
   */
  async getYearLinks(baseUrl: string): Promise<string[]> {
    const result = await fetchHtml(baseUrl);
    if (!result.success) {
      throw new Error(`Failed to fetch base URL: ${baseUrl}`);
    }
    
    const $ = loadCheerio(result.html);
    const yearLinks: string[] = [];
    
    // Extract year links from the page
    $('ul li a').each((_, element) => {
      const href = extractAttribute($(element), 'href');
      const text = extractText($(element));
      
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
  async getInterpretationLinks(yearUrl: string): Promise<string[]> {
    const result = await fetchHtml(yearUrl);
    if (!result.success) {
      throw new Error(`Failed to fetch year page: ${yearUrl}`);
    }
    
    const $ = loadCheerio(result.html);
    const interpretationLinks: string[] = [];
    
    // Extract interpretation links from the page
    $('div.view-content a').each((_, element) => {
      const href = extractAttribute($(element), 'href');
      
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
  private extractPageContent($: cheerio.CheerioAPI): Record<string, string | string[]> {
    const extracted: Record<string, string | string[]> = {}; 
    
    // Extract from selectors
    if (this.extractorConfig.selectors) {
      const selectorResults = extractFromHtml($, this.extractorConfig.selectors);
      
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
        const patternResults = extractFromText(extracted.content as string, this.extractorConfig.patterns);
        
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
  private parseDate(dateString: string | string[] | undefined): Date | undefined {
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
  private createInterpretation(url: string, extracted: Record<string, string | string[]>): Omit<OshaInterpretation, '_id'> {
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
      documentDate: new Date(url.split('/').pop()),
      title,
      content: contentText,
      images: Array.isArray(extracted.images) ? extracted.images.map(img => new URL(img, Settings.crawlee.osha.linksBaseUrl).href) : [],
      standardNumberLinks: Array.isArray(extracted.standardNumberLinks) ? extracted.standardNumberLinks.map(link => new URL(link, Settings.crawlee.osha.linksBaseUrl).href) : [],
      successful: true,
      errors: []
    };
  }
  
  /**
   * Scrape a single interpretation by URL
   */
  async scrapeInterpretationByUrl(url: string): Promise<ScrapingResult> {
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
      const fetchResult = await fetchHtml(url);
      
      if (!fetchResult.success) {
        return {
          url,
          successful: false,
          errors: [fetchResult.error || 'Failed to fetch URL']
        };
      }
      
      // Extract content
      const $ = loadCheerio(fetchResult.html);
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
    } catch (error) {
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
  getRepository(): OshaInterpretationsRepo {
    return this.repo;
  }
  

  
  /**
   * Update the extractor configuration
   */
  updateExtractorConfig(config: ExtractorConfig): void {
    this.extractorConfig = config;
  }
  
  /**
   * Save scrape results to the database
   */
  async saveScrapeResults(results: ScrapingResult[]): Promise<void> {
    const successfulResults = results.filter(result => result.successful);
    console.log(`Saving ${successfulResults.length} successful results out of ${results.length} total`);
    
    for (const result of successfulResults) {
      try {
        if (await this.repo.existsByUrl(result.url)) {
          console.log(`Skipping ${result.url} - already exists`);
          continue;
        }
        await this.scrapeInterpretationByUrl(result.url);
      } catch (error) {
        console.error(`Failed to save result for ${result.url}:`, error);
      }
    }
  }
}
