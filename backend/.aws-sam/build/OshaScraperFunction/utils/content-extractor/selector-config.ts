/**
 * Configuration for a selector to extract content
 */

export interface SelectorConfig {
  name: string;
  selector: string;
  multiple?: boolean;
  attribute?: string;
  transform?: (text: string) => string;
  index?: number;
}

export interface PatternConfig {
  name: string;
  pattern: string | RegExp;
  groupIndex?: number;
  global?: boolean;
  transform?: (text: string) => string;
  flags?: string;
  sourceSelector?: string; // Name of the selector to use as source for pattern matching
}

export interface ExtractResult {
  name: string;
  value: string | string[];
  success: boolean;
}

export interface ExtractorConfig {
  selectors?: SelectorConfig[];
  patterns?: PatternConfig[];
}
