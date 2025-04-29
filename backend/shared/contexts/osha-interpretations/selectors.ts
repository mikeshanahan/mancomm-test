/* 
These are the selector definitions for pulling and naming the different content we want from an osha interpretation page
*/

import { SelectorConfig } from '../../utils/content-extractor/selector-config';


export const DEFAULT_SELECTORS: SelectorConfig[] = [
    {
        name: 'title',
        selector: 'title',
        attribute: 'text',
        multiple: false,
        transform: (text) => text.trim()
    },
    {
        name: 'content',
        selector: '.field--name-body',
        attribute: 'text',
        multiple: false,
        transform: (text) => text.trim(),
        index: 2
    },
    {
        name: 'standardNumberLinks',
        selector: '.field--name-field-fr-standard-number a',
        attribute: 'href',
        multiple: true,
        transform: (text) => text.trim()
    },
    {
        name: 'images',
        selector: 'div.field--item img',
        attribute: 'src',
        multiple: true
    }
];
