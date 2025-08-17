/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Truong Ba An
# ID: s3999568 */

import { Router, Request, Response } from 'express';
import { validationMiddleware } from '../middleware/validation.middleware';
import { get } from 'http';
import { getCartQuerrySchema, getCartController } from '../controllers/shoppingCartController';

const ShoppingCartRouter = Router();

//view the shopping cart of the customer
ShoppingCartRouter.get("/", validationMiddleware(getCartQuerrySchema, 'query'), getCartController);

export default ShoppingCartRouter;