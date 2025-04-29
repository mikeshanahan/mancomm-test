"use strict";
/*
DB access class for the osha interpretations collection
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.OshaInterpretationsRepo = void 0;
const mongo_repo_1 = require("../../vendors/mongodb/mongo-repo");
const config_1 = require("../../config");
class OshaInterpretationsRepo extends mongo_repo_1.MongoRepository {
    constructor() {
        super(config_1.Collections.OSHA_INTERPRETATIONS);
    }
    /**
     * Check if an interpretation with the given URL already exists
     */
    async existsByUrl(url) {
        const count = await this.collection.countDocuments({ url, successful: true });
        return count > 0;
    }
    /**
     * Get all URLs that have been scraped
     */
    async getAllUrls() {
        const docs = await this.collection.find({}, { projection: { url: 1 } }).toArray();
        return docs.map(doc => doc.url);
    }
    /**
     * Save an interpretation to the database
     */
    async saveInterpretation(interpretation) {
        return this.create(interpretation);
    }
}
exports.OshaInterpretationsRepo = OshaInterpretationsRepo;
