/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: 
# ID:  */

import { Router, Request, Response } from 'express';
import { getAllDistributionHubsController } from '../controllers/distribution_hubs/getDistributionHubs.controller';

const DistributionHubRouter = Router();

DistributionHubRouter.get("/", getAllDistributionHubsController);

export default DistributionHubRouter;