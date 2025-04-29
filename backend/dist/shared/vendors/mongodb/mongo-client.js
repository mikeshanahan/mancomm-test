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
exports.MongoClient = void 0;
exports.getClient = getClient;
const mongodb_1 = require("mongodb");
const config_1 = require("../../config");
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
    connect(uri_1, dbName_1) {
        return __awaiter(this, arguments, void 0, function* (uri, dbName, options = {}) {
            if (!this.client) {
                this.client = new mongodb_1.MongoClient(uri, options);
                yield this.client.connect();
                this.db = this.client.db(dbName);
            }
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.client) {
                yield this.client.close();
                this.client = null;
                this.db = null;
            }
        });
    }
    getCollection(collectionName) {
        if (!this.db) {
            throw new Error('Database connection not established');
        }
        return this.db.collection(collectionName);
    }
    createIndex(collectionName_1, fieldOrSpec_1) {
        return __awaiter(this, arguments, void 0, function* (collectionName, fieldOrSpec, options = {}) {
            const collection = this.getCollection(collectionName);
            return collection.createIndex(fieldOrSpec, options);
        });
    }
    createTextIndex(collectionName_1, fields_1) {
        return __awaiter(this, arguments, void 0, function* (collectionName, fields, options = {}) {
            const textIndexSpec = {};
            fields.forEach(field => {
                textIndexSpec[field] = 'text';
            });
            return this.createIndex(collectionName, textIndexSpec, options);
        });
    }
    isConnected() {
        return !!this.client && !!this.db;
    }
}
exports.MongoClient = MongoClient;
MongoClient.instance = null;
function getClient() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = MongoClient.getInstance();
        yield client.connect(config_1.Settings.mongo.uri, config_1.Settings.mongo.dbName);
        return client;
    });
}
