/* 
This module handles the synchronization of OSHA interpretations.
It traverses the initial page and all year pages to collect interpretation links,
then concurrently scrapes and stores any interpretations that don't exist in the database.
*/

import { chunkArray } from '../../utils/utils';
import { OshaInterpretationsService } from './osha-interpretations';
import { ScrapingResult } from './types';

export class OshaInterpretationsSyncService {
  private service: OshaInterpretationsService;
  private baseUrl: string;
  private concurrencyLimit: number;

  constructor(
    service: OshaInterpretationsService,
    baseUrl: string = 'https://www.osha.gov/laws-regs/standardinterpretations/publicationdate',
    concurrencyLimit: number = 5
  ) {
    this.service = service;
    this.baseUrl = baseUrl;
    this.concurrencyLimit = concurrencyLimit;
  }

  /**
   * Synchronize OSHA interpretations by scraping new ones
   * @param maxInterpretations Optional limit on the number of interpretations to scrape
   */
  async syncInterpretations(maxInterpretations?: number): Promise<ScrapingResult[]> {
    console.log('Starting OSHA interpretations sync...');
    
    // Get year links
    const yearLinks = await this.service.getYearLinks(this.baseUrl);
    console.log(`Found ${yearLinks.length} year links`);
    
    const results: ScrapingResult[] = [];
    let totalProcessed = 0;
    
    // Process year by year to avoid building a massive list in memory
    for (const yearLink of yearLinks) {
      console.log(`Processing year link: ${yearLink}`);
      
      try {
        // Get interpretation links for this year
        const interpretationLinks = await this.service.getInterpretationLinks(yearLink);
        console.log(`Found ${interpretationLinks.length} interpretation links for ${yearLink}`);
        
        if (interpretationLinks.length === 0) continue;
        
        // Get existing URLs from database
        const existingUrls = await this.service.getRepository().getAllUrls();
        
        // Filter out links that already exist in the database
        const newLinks = interpretationLinks.filter(url => !existingUrls.includes(url));
        if (newLinks.length === 0) continue;
        
        // Process this year's links
        const yearResults = await this.processYearLinks(newLinks, maxInterpretations, totalProcessed);
        results.push(...yearResults);
        
        totalProcessed += yearResults.length;
        
        // Check if we've reached the max limit
        if (maxInterpretations && totalProcessed >= maxInterpretations) {
          console.log(`Reached maximum limit of ${maxInterpretations} interpretations`);
          break;
        }
      } catch (error) {
        console.error(`Error processing year ${yearLink}:`, error);
      }
    }
    
    return results;
  }

  /**
   * Process links for a specific year
   */
  private async processYearLinks(links: string[], maxInterpretations?: number, alreadyProcessed: number = 0): Promise<ScrapingResult[]> {
    const results: ScrapingResult[] = [];
    
    // Determine how many links to process from this year
    let linksToProcess = links;
    if (maxInterpretations) {
      const remaining = maxInterpretations - alreadyProcessed;
      if (remaining <= 0) return [];
      if (links.length > remaining) {
        linksToProcess = links.slice(0, remaining);
      }
    }
    
    // Process links in smaller chunks to avoid lock file issues
    const chunks = chunkArray(linksToProcess, this.concurrencyLimit);
    
    for (const chunk of chunks) {
      try {
        // Process each chunk with a small delay between chunks to avoid lock issues
        const chunkPromises = chunk.map(url => this.service.scrapeInterpretationByUrl(url));
        const chunkResults = await Promise.all(chunkPromises);
        
        // Save results immediately
        await this.service.saveScrapeResults(chunkResults);
        
        results.push(...chunkResults);
        
        // Log progress
        console.log(`Processed ${results.length}/${linksToProcess.length} links for this year`);
        
        // Add a small delay between chunks to avoid lock file issues
        if (chunks.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error('Error processing chunk:', error);
      }
    }
    
    return results;
  }

}