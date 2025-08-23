/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Nguyen The Anh
# ID: s3975844 */

import { Router, Request, Response } from 'express';
import { validationMiddleware } from '../middleware/validation.middleware';
import { getOrdersController, getOrdersQuerrySchema, updateOrderStatusController } from '../controllers/orderController';
import { getOrderItemsController, getOrderItemsParamsSchema } from '../controllers/orderItemController';


const OrderRouter = Router();
//get all the orders of the shipper from the specific distribution hub
OrderRouter.get("/", validationMiddleware(getOrdersQuerrySchema, 'query'), getOrdersController);

//update the satus of the order
OrderRouter.put("/:id/status", validationMiddleware(getOrdersQuerrySchema, 'query'), updateOrderStatusController);

//get all the items of a specific order
OrderRouter.get("/:id/items", validationMiddleware(getOrderItemsParamsSchema, "params"), getOrderItemsController);
export default OrderRouter