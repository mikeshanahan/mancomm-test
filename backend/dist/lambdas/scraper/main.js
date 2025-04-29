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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const osha_interpretations_1 = require("../../shared/contexts/osha-interpretations/osha-interpretations");
const sync_interpretations_1 = require("../../shared/contexts/osha-interpretations/sync-interpretations");
const handler = (event, _) => __awaiter(void 0, void 0, void 0, function* () {
    const interpretationsService = new osha_interpretations_1.OshaInterpretationsService();
    const syncService = new sync_interpretations_1.OshaInterpretationsSyncService(interpretationsService);
    const result = yield syncService.syncInterpretations();
    console.log('Sync completed successfully:', result);
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'OSHA interpretations sync completed successfully',
            result
        })
    };
});
exports.handler = handler;
