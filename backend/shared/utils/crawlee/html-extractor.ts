import { CheerioCrawlingContext } from 'crawlee';
import { SelectorConfig, PatternConfig, ExtractorConfig } from '../content-extractor/selector-config';
import { extractContent, extractFromHtml, extractFromText } from '../content-extractor/extractor';

/**
 * Result from extracting content from a page
 */
export interface ExtractedContent {
  url: string;
  content: Record<string, string | string[]>;
  success: boolean;
  error?: string;
}

/**
 * Extracts content from a Crawlee context using a configuration
 */
export function extractFromContext(
  context: CheerioCrawlingContext,
  config: ExtractorConfig
): ExtractedContent {
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
    const content = extractContent($, config);
    
    return {
      url: request.url,
      content,
      success: true
    };
  } catch (error) {
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
export function createContentProcessor(
  config: ExtractorConfig
): (context: CheerioCrawlingContext) => ExtractedContent {
  return (context) => extractFromContext(context, config);
}

/**
 * Extracts specific selectors from a Crawlee context
 */
export function extractSelectors(
  context: CheerioCrawlingContext,
  selectors: SelectorConfig[]
) {
  const { $ } = context;
  if (!$) return [];
  
  return extractFromHtml($, selectors);
}

/**
 * Extracts text patterns from a Crawlee context
 */
export function extractPatterns(
  context: CheerioCrawlingContext,
  patterns: PatternConfig[]
) {
  const { $ } = context;
  if (!$) return [];
  
  const text = $('body').text().trim();
  return extractFromText(text, patterns);
}
