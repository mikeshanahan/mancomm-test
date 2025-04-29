"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUESTION_PATTERNS = void 0;
exports.extractQuestions = extractQuestions;
exports.createQuestionExtractor = createQuestionExtractor;
const extractor_1 = require("./extractor");
/**
 * Predefined patterns for extracting questions
 */
exports.QUESTION_PATTERNS = [
    {
        name: 'questionFull',
        pattern: /question:\s*([^\n]+)/gi,
        global: true,
        transform: (text) => text.trim()
    },
    {
        name: 'questionShort',
        pattern: /q:\s*([^\n]+)/gi,
        global: true,
        transform: (text) => text.trim()
    },
    {
        name: 'questionMark',
        pattern: /([^.!?\n]+\?)/gi,
        global: true,
        transform: (text) => text.trim()
    }
];
/**
 * Extracts questions from text using predefined patterns
 */
function extractQuestions(text) {
    const results = (0, extractor_1.extractFromText)(text, exports.QUESTION_PATTERNS);
    // Combine all successful results
    const questions = [];
    for (const result of results) {
        if (result.success && Array.isArray(result.value)) {
            questions.push(...result.value);
        }
    }
    // Remove duplicates
    return [...new Set(questions)];
}
/**
 * Creates a custom question extractor with additional patterns
 */
function createQuestionExtractor(additionalPatterns = []) {
    const patterns = [...exports.QUESTION_PATTERNS, ...additionalPatterns];
    return (text) => {
        const results = (0, extractor_1.extractFromText)(text, patterns);
        const questions = [];
        for (const result of results) {
            if (result.success && Array.isArray(result.value)) {
                questions.push(...result.value);
            }
        }
        return [...new Set(questions)];
    };
}
