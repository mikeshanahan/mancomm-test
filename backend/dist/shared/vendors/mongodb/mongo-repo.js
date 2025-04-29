"use strict";
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
exports.MongoRepository = void 0;
const mongodb_1 = require("mongodb");
const mongo_client_1 = require("./mongo-client");
class MongoRepository {
    constructor(collectionName) {
        this.collectionName = collectionName;
        const mongoClient = mongo_client_1.MongoClient.getInstance();
        this.collection = mongoClient.getCollection(collectionName);
    }
    // Create operations
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            const document = Object.assign(Object.assign({}, data), { _id: new mongodb_1.ObjectId().toString(), createdAt: now, updatedAt: now });
            yield this.collection.insertOne(document);
            return document;
        });
    }
    createMany(dataArray) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            const documents = dataArray.map(data => (Object.assign(Object.assign({}, data), { _id: new mongodb_1.ObjectId().toString(), createdAt: now, updatedAt: now })));
            yield this.collection.insertMany(documents);
            return documents;
        });
    }
    // Read operations
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.collection.findOne({ _id: id });
        });
    }
    findOne(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.collection.findOne(filter);
        });
    }
    find() {
        return __awaiter(this, arguments, void 0, function* (query = {}) {
            const { filter = {}, sort, limit, skip, options = {} } = query;
            let cursor = this.collection.find(filter, options);
            if (sort) {
                cursor = cursor.sort(sort);
            }
            if (skip) {
                cursor = cursor.skip(skip);
            }
            if (limit) {
                cursor = cursor.limit(limit);
            }
            return cursor.toArray();
        });
    }
    count() {
        return __awaiter(this, arguments, void 0, function* (filter = {}) {
            return this.collection.countDocuments(filter);
        });
    }
    // Text search operations
    textSearch(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { text, filter = {}, sort, limit, skip, options = {} } = query;
            const searchFilter = Object.assign(Object.assign({}, filter), { $text: { $search: text } });
            let cursor = this.collection.find(searchFilter, Object.assign(Object.assign({}, options), { projection: { score: { $meta: 'textScore' } } }));
            // Default sort by text score if no sort is provided
            const textSort = sort || { score: { $meta: 'textScore' } };
            cursor = cursor.sort(textSort);
            if (skip) {
                cursor = cursor.skip(skip);
            }
            if (limit) {
                cursor = cursor.limit(limit);
            }
            return cursor.toArray();
        });
    }
    // Update operations
    updateById(id_1, update_1) {
        return __awaiter(this, arguments, void 0, function* (id, update, options = {}) {
            const updateData = {
                $set: Object.assign(Object.assign({}, update), { updatedAt: new Date() })
            };
            const result = yield this.collection.findOneAndUpdate({ _id: id }, updateData, Object.assign({ returnDocument: 'after' }, options));
            return result;
        });
    }
    // Delete operations
    deleteById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.collection.deleteOne({ _id: id });
            return result.deletedCount === 1;
        });
    }
}
exports.MongoRepository = MongoRepository;
