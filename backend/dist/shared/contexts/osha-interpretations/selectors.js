"use strict";
/*
These are the selector definitions for pulling and naming the different content we want from an osha interpretation page
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PATTERNS = exports.DEFAULT_SELECTORS = void 0;
exports.DEFAULT_SELECTORS = [
    {
        name: 'content',
        selector: '.field--name-body',
        attribute: 'innerText',
        multiple: false,
        transform: (text) => text.trim()
    },
    {
        name: 'title',
        selector: 'title',
        attribute: 'innerText',
        multiple: false,
        transform: (text) => text.trim()
    },
    {
        name: 'date',
        selector: '.field--name-body p:first-child',
        attribute: 'innerText',
        multiple: false,
        transform: (text) => text.trim()
    },
    {
        name: 'standardNumber',
        selector: '.field--name-field-fr-standard-number a',
        attribute: 'innerText',
        multiple: false,
        transform: (text) => text.trim()
    },
    {
        name: 'images',
        selector: '.field--name-body img',
        attribute: 'src',
        multiple: true
    }
];
exports.DEFAULT_PATTERNS = [
    {
        name: 'standardNumbers',
        pattern: /\b(?:29 CFR )?(?:1910|1915|1917|1918|1926)\.\d+(?:\([a-z0-9]+\))?/gi,
        global: true
    },
    {
        name: 'questions',
        pattern: /(?:Question|Q):\s*([^\n]+)/gi,
        global: true,
        groupIndex: 1
    },
    {
        name: 'memoDate',
        pattern: /([A-Z][a-z]+ \d{1,2}, \d{4})/,
        global: false
    }
];
