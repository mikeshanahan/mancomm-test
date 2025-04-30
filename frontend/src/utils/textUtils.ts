/**
 * Find the first match of the full search term in the text
 * @param text The text to search in
 * @param searchTerms Array of search terms to find (only the full term is used)
 * @returns The index of the first match or -1 if no match
 */
export const findFirstMatch = (text: string, searchTerms: string[]): number => {
  if (!text || !searchTerms.length || !searchTerms[0]) return -1;
  
  const lowerText = text.toLowerCase();
  const searchTerm = searchTerms[0].toLowerCase();
  
  // Only search for the full term, not individual words
  return lowerText.indexOf(searchTerm);
};

/**
 * Get a truncated version of text that includes the first match of search terms
 * @param text The text to truncate
 * @param searchTerms Array of search terms to find (only the full term is used)
 * @param maxLength Maximum length of the truncated text
 * @returns Truncated text with context around the first match
 */
export const getTruncatedTextWithMatch = (text: string, searchTerms: string[], maxLength: number = 300): string => {
  if (!text) return '';
  if (!searchTerms.length || !searchTerms[0]) return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  
  const firstMatchIndex = findFirstMatch(text, searchTerms);
  
  if (firstMatchIndex === -1) {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  }
  
  // Calculate start and end positions to show context around the match
  let startPos = Math.max(0, firstMatchIndex - Math.floor(maxLength / 3));
  let endPos = Math.min(text.length, startPos + maxLength);
  
  // Adjust if we're near the end
  if (endPos >= text.length) {
    startPos = Math.max(0, text.length - maxLength);
    endPos = text.length;
  }
  
  // Add ellipsis if needed
  const prefix = startPos > 0 ? '...' : '';
  const suffix = endPos < text.length ? '...' : '';
  
  return `${prefix}${text.substring(startPos, endPos)}${suffix}`;
};
