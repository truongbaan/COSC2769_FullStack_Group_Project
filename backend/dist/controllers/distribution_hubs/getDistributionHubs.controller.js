"use strict";
/* RMIT University Vietnam
# Course: COSC2769 - Full Stack Development
# Semester: 2025B
# Assessment: Assignment 02
# Author:
# ID:  */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllDistributionHubsController = exports.getAllHubsQuerySchema = void 0;
const z = __importStar(require("zod"));
const distribution_hubs_service_1 = require("../../service/distribution_hubs.service");
const json_mes_1 = require("../../utils/json_mes");
exports.getAllHubsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    size: z.coerce.number().int().min(1).max(50).default(20),
});
const getAllDistributionHubsController = async (req, res) => {
    try {
        const { page, size } = exports.getAllHubsQuerySchema.parse(req.query);
        const hubs = await distribution_hubs_service_1.DistributionHubService.getAllDistributionHubs({ page, size });
        if (hubs === null) {
            return (0, json_mes_1.ErrorJsonResponse)(res, 500, "Failed to fetch distribution hubs");
        }
        return (0, json_mes_1.SuccessJsonResponse)(res, 200, {
            data: { hubs, count: hubs.length, page, size },
        });
    }
    catch (err) {
        if (err?.issues?.length) {
            return (0, json_mes_1.ErrorJsonResponse)(res, 400, err.issues[0].message || "Invalid query parameters");
        }
        console.error(err);
        return (0, json_mes_1.ErrorJsonResponse)(res, 500, "Unexpected error while fetching distribution hubs");
    }
};
exports.getAllDistributionHubsController = getAllDistributionHubsController;
