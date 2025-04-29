"use strict";
/*
These are the selector definitions for pulling and naming the different content we want from an osha interpretation page
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SELECTORS = void 0;
exports.DEFAULT_SELECTORS = [
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
