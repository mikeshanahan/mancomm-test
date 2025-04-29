"use strict";
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
    async create(data) {
        const now = new Date();
        const document = {
            ...data,
            _id: new mongodb_1.ObjectId().toString(),
            createdAt: now,
            updatedAt: now
        };
        await this.collection.insertOne(document);
        return document;
    }
    async createMany(dataArray) {
        const now = new Date();
        const documents = dataArray.map(data => ({
            ...data,
            _id: new mongodb_1.ObjectId().toString(),
            createdAt: now,
            updatedAt: now
        }));
        await this.collection.insertMany(documents);
        return documents;
    }
    // Read operations
    async findById(id) {
        return this.collection.findOne({ _id: id });
    }
    async findOne(filter) {
        return this.collection.findOne(filter);
    }
    async find(query = {}) {
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
    }
    async count(filter = {}) {
        return this.collection.countDocuments(filter);
    }
    // Text search operations
    async textSearch(query) {
        const { text, filter = {}, sort, limit, skip, options = {} } = query;
        const searchFilter = {
            ...filter,
            $text: { $search: text }
        };
        let cursor = this.collection.find(searchFilter, {
            ...options,
            projection: { score: { $meta: 'textScore' } }
        });
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
    }
    // Update operations
    async updateById(id, update, options = {}) {
        const updateData = {
            $set: {
                ...update,
                updatedAt: new Date()
            }
        };
        const result = await this.collection.findOneAndUpdate({ _id: id }, updateData, { returnDocument: 'after', ...options });
        return result;
    }
    // Delete operations
    async deleteById(id) {
        const result = await this.collection.deleteOne({ _id: id });
        return result.deletedCount === 1;
    }
}
exports.MongoRepository = MongoRepository;
