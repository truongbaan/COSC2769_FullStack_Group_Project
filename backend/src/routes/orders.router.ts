/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Nguyen The Anh
# ID: s3975844 */

import { Router, Request, Response } from 'express';
import { validationMiddleware } from '../middleware/validation.middleware';
import { getOrdersController, getOrdersQuerrySchema } from '../controllers/orderController';


const OrderRouter = Router();

OrderRouter.get("/", validationMiddleware(getOrdersQuerrySchema, 'query'), getOrdersController);

export default OrderRouter