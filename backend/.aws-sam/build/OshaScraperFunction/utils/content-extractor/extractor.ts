import { SelectorConfig, PatternConfig, ExtractResult, ExtractorConfig } from './selector-config';
import * as cheerio from 'cheerio';

/**
 * Extracts content using CSS selectors with Cheerio
 */
export function extractFromHtml($: cheerio.CheerioAPI, selectors: SelectorConfig[]): ExtractResult[] {
  const results: ExtractResult[] = [];
  
  for (const config of selectors) {
    try {
      if (config.multiple) {
        // Extract multiple elements
        const values: string[] = [];
        
        $(config.selector).each((_, el) => {
          let value: string;
          
          if (config.attribute === 'text') {
            value = $(el).text().trim();
          } else if (config.attribute) {
            value = $(el).attr(config.attribute) || '';
          } else {
            value = $(el).text().trim();
          }
          
          if (config.transform) {
            value = config.transform(value);
          }
          
          if (value) {
            values.push(value);
          }
        });
        
        results.push({
          name: config.name,
          value: values,
          success: values.length > 0
        });
      } else {
        // Extract single element
        let el;
        
        if (config.index !== undefined) {
          // Use specific index if provided
          el = $(config.selector).eq(config.index);
        } else {
          // Default to first element
          el = $(config.selector).first();
        }
        
        if (el.length === 0) {
          results.push({
            name: config.name,
            value: '',
            success: false
          });
          continue;
        }
        
        let value: string;
        
        if (config.attribute === 'text') {
          value = el.text().trim();
        } else if (config.attribute) {
          value = el.attr(config.attribute) || '';
        } else {
          value = el.text().trim();
        }
        
        if (config.transform) {
          value = config.transform(value);
        }
        
        results.push({
          name: config.name,
          value,
          success: !!value
        });
      }
    } catch (error) {
      results.push({
        name: config.name,
        value: '',
        success: false
      });
    }
  }
  
  return results;
}

/**
 * Extracts content from text using patterns
 */
export function extractFromText(text: string, patterns: PatternConfig[]): ExtractResult[] {
  const results: ExtractResult[] = [];
  
  for (const config of patterns) {
    try {
      // Create RegExp from pattern
      const regex = typeof config.pattern === 'string' 
        ? new RegExp(config.pattern, config.global ? 'g' + (config.flags || '') : config.flags)
        : config.pattern;
      
      const groupIndex = config.groupIndex || 1;
      
      if (config.global) {
        // Extract all matches
        const matches: string[] = [];
        let match;
        
        // Clone the regex to reset lastIndex
        const globalRegex = new RegExp(regex.source, 'g' + (regex.flags?.replace('g', '') || ''));
        
        while ((match = globalRegex.exec(text)) !== null) {
          if (match[groupIndex]) {
            let value = match[groupIndex];
            
            if (config.transform) {
              value = config.transform(value);
            }
            
            if (value) {
              matches.push(value);
            }
          }
        }
        
        results.push({
          name: config.name,
          value: matches,
          success: matches.length > 0
        });
      } else {
        // Extract first match
        const match = regex.exec(text);
        
        if (!match || !match[groupIndex]) {
          results.push({
            name: config.name,
            value: '',
            success: false
          });
          continue;
        }
        
        let value = match[groupIndex];
        
        if (config.transform) {
          value = config.transform(value);
        }
        
        results.push({
          name: config.name,
          value,
          success: !!value
        });
      }
    } catch (error) {
      results.push({
        name: config.name,
        value: '',
        success: false
      });
    }
  }
  
  return results;
}

/**
 * Extracts content using a combined configuration
 */
export function extractContent($: cheerio.CheerioAPI, config: ExtractorConfig): Record<string, string | string[]> {
  const results: Record<string, string | string[]> = {};
  
  // Extract using selectors
  if (config.selectors && config.selectors.length > 0) {
    const selectorResults = extractFromHtml($, config.selectors);
    
    for (const result of selectorResults) {
      if (result.success) {
        results[result.name] = result.value;
      }
    }
  }
  
  // Extract from text using patterns
  if (config.patterns && config.patterns.length > 0) {
    for (const pattern of config.patterns) {
      // If pattern has a sourceSelector, use that selector's value as the source text
      if (pattern.sourceSelector && results[pattern.sourceSelector]) {
        const sourceText = Array.isArray(results[pattern.sourceSelector]) 
          ? (results[pattern.sourceSelector] as string[]).join('\n') 
          : results[pattern.sourceSelector] as string;
        
        const patternResults = extractFromText(sourceText, [pattern]);
        
        for (const result of patternResults) {
          if (result.success) {
            results[result.name] = result.value;
          }
        }
      } else {
        // Default behavior: extract from body text
        const text = $('body').text().trim();
        const patternResults = extractFromText(text, [pattern]);
        
        for (const result of patternResults) {
          if (result.success) {
            results[result.name] = result.value;
          }
        }
      }
    }
  }
  
  return results;
}
