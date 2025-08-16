"use strict";
/* RMIT University Vietnam
# Course: COSC2769 - Full Stack Development
# Semester: 2025B
# Assessment: Assignment 02
# Author: Truong Ba An
# ID: s3999568 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//place to hold all routers
const express_1 = require("express");
const auth_router_1 = __importDefault(require("./auth.router"));
const user_router_1 = __importDefault(require("./user.router"));
const products_router_1 = __importDefault(require("./products.router"));
const requireAuth_1 = require("../middleware/requireAuth");
const distribution_hubs_router_1 = __importDefault(require("./distribution_hubs.router"));
const apiRouter = (0, express_1.Router)();
apiRouter.use('/auth', auth_router_1.default);
apiRouter.use('/users', requireAuth_1.requireAuth, user_router_1.default);
apiRouter.use("/products", requireAuth_1.requireAuth, products_router_1.default);
apiRouter.use("/distribution-hubs", requireAuth_1.requireAuth, distribution_hubs_router_1.default);
exports.default = apiRouter;
