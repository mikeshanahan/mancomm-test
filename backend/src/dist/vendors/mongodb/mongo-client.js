"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoClient = void 0;
const mongodb_1 = require("mongodb");
class MongoClient {
    constructor() {
        this.client = null;
        this.db = null;
    }
    static getInstance() {
        if (!MongoClient.instance) {
            MongoClient.instance = new MongoClient();
        }
        return MongoClient.instance;
    }
    async connect(uri, dbName, options = {}) {
        if (!this.client) {
            this.client = new mongodb_1.MongoClient(uri, options);
            await this.client.connect();
            this.db = this.client.db(dbName);
        }
    }
    async disconnect() {
        if (this.client) {
            await this.client.close();
            this.client = null;
            this.db = null;
        }
    }
    getCollection(collectionName) {
        if (!this.db) {
            throw new Error('Database connection not established');
        }
        return this.db.collection(collectionName);
    }
    async createIndex(collectionName, fieldOrSpec, options = {}) {
        const collection = this.getCollection(collectionName);
        return collection.createIndex(fieldOrSpec, options);
    }
    async createTextIndex(collectionName, fields, options = {}) {
        const textIndexSpec = {};
        fields.forEach(field => {
            textIndexSpec[field] = 'text';
        });
        return this.createIndex(collectionName, textIndexSpec, options);
    }
    isConnected() {
        return !!this.client && !!this.db;
    }
}
exports.MongoClient = MongoClient;
MongoClient.instance = null;
