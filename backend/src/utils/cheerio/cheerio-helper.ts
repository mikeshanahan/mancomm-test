/**
 * Helper functions for working with Cheerio
 */

import * as cheerio from 'cheerio';

export function loadCheerio(html: string): cheerio.CheerioAPI {
  return cheerio.load(html);
}

export function extractText($element: cheerio.Cheerio<any>): string {
  return $element.text().trim();
}

export function extractAttribute($element: cheerio.Cheerio<any>, attribute: string): string | undefined {
  return $element.attr(attribute);
}

export function selectElements($: cheerio.CheerioAPI, selector: string): cheerio.Cheerio<any> {
  return $(selector);
}
