"use strict";
/* RMIT University Vietnam
# Course: COSC2769 - Full Stack Development
# Semester: 2025B
# Assessment: Assignment 02
# Author:
# ID:  */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const getDistributionHubs_controller_1 = require("../controllers/distribution_hubs/getDistributionHubs.controller");
const DistributionHubRouter = (0, express_1.Router)();
// GET /api/distribution-hubs?page=&size=
DistributionHubRouter.get("/", getDistributionHubs_controller_1.getAllDistributionHubsController);
exports.default = DistributionHubRouter;
