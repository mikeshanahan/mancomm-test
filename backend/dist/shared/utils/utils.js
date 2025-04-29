"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chunkArray = chunkArray;
function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}
