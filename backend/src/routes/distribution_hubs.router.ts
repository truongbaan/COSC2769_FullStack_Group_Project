/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: 
# ID:  */

import { Router, Request, Response } from 'express';
import { getAllDistributionHubsController, getAllHubsQuerrySchema } from '../controllers/getDistributionHubsController';
import { validationMiddleware } from '../middleware/validation.middleware';

const DistributionHubRouter = Router();

DistributionHubRouter.get("/", validationMiddleware(getAllHubsQuerrySchema, 'query'), getAllDistributionHubsController);

export default DistributionHubRouter;