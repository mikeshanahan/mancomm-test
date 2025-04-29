"use strict";
/*
DB access class for the osha interpretations collection
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    existsByUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield this.collection.countDocuments({ url });
            return count > 0;
        });
    }
    /**
     * Get all URLs that have been scraped
     */
    getAllUrls() {
        return __awaiter(this, void 0, void 0, function* () {
            const docs = yield this.collection.find({}, { projection: { url: 1 } }).toArray();
            return docs.map(doc => doc.url);
        });
    }
    /**
     * Save an interpretation to the database
     */
    saveInterpretation(interpretation) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.create(interpretation);
        });
    }
}
exports.OshaInterpretationsRepo = OshaInterpretationsRepo;
