"use strict";
/*
A lambda that runs on a schedule (once an hour) to ensure that all interpretation links have been scraped and put into the database
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
// Dynamic imports for Lambda compatibility 
var getImports = function () {
    try {
        // Check if we're running in Lambda
        require.resolve('/opt/nodejs/node_modules/shared');
        // Lambda path
        return {
            MongoClient: require('/opt/nodejs/node_modules/shared/vendors/mongodb/mongo-client').MongoClient,
            OshaInterpretationsService: require('/opt/nodejs/node_modules/shared/contexts/osha-interpretations/osha-interpretations').OshaInterpretationsService,
            OshaInterpretationsSyncService: require('/opt/nodejs/node_modules/shared/contexts/osha-interpretations/sync-interpretations').OshaInterpretationsSyncService
        };
    }
    catch (e) {
        // Local path
        return {
            MongoClient: require('./shared/vendors/mongodb/mongo-client').MongoClient,
            OshaInterpretationsService: require('./shared/contexts/osha-interpretations/osha-interpretations').OshaInterpretationsService,
            OshaInterpretationsSyncService: require('./shared/contexts/osha-interpretations/sync-interpretations').OshaInterpretationsSyncService
        };
    }
};
var _a = getImports(), MongoClient = _a.MongoClient, OshaInterpretationsService = _a.OshaInterpretationsService, OshaInterpretationsSyncService = _a.OshaInterpretationsSyncService;
var handler = function (event, _) { return __awaiter(void 0, void 0, void 0, function () {
    var mongoClient, interpretationsService, syncService, maxInterpretations, result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, 4, 6]);
                mongoClient = MongoClient.getInstance();
                return [4 /*yield*/, mongoClient.connect(process.env.MONGODB_URI, process.env.MONGODB_NAME)];
            case 1:
                _a.sent();
                interpretationsService = new OshaInterpretationsService();
                syncService = new OshaInterpretationsSyncService(interpretationsService);
                maxInterpretations = process.env.MAX_INTERPRETATIONS ? parseInt(process.env.MAX_INTERPRETATIONS) : 100;
                return [4 /*yield*/, syncService.syncInterpretations(maxInterpretations)];
            case 2:
                result = _a.sent();
                console.log('Sync completed successfully:', result);
                return [2 /*return*/, {
                        statusCode: 200,
                        body: JSON.stringify({
                            message: 'OSHA interpretations sync completed successfully',
                            result: result
                        })
                    }];
            case 3:
                error_1 = _a.sent();
                console.error('Error during sync operation:', error_1);
                return [2 /*return*/, {
                        statusCode: 500,
                        body: JSON.stringify({
                            message: 'Error during OSHA interpretations sync',
                            error: error_1.message
                        })
                    }];
            case 4: 
            // Close MongoDB connection
            return [4 /*yield*/, MongoClient.getInstance().disconnect()];
            case 5:
                // Close MongoDB connection
                _a.sent();
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.handler = handler;
