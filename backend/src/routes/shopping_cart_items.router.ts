/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Nguyen The Anh
# ID: s3975844*/

import { Router, Request, Response } from 'express';
import { validationMiddleware } from '../middleware/validation.middleware';
import { get } from 'http';
import { getCartQuerrySchema, getCartController, deleteByIdParamsSchema, deleteCartItemByIdController} from '../controllers/shoppingCartController';
import { de } from 'zod/v4/locales/index.cjs';

const ShoppingCartRouter = Router();

//view the shopping cart of the customer
ShoppingCartRouter.get("/", validationMiddleware(getCartQuerrySchema, 'query'), getCartController);

//delete the product in shoppping cart by id
ShoppingCartRouter.delete("/deleteItem/:id", validationMiddleware(deleteByIdParamsSchema, 'params'), deleteCartItemByIdController);
export default ShoppingCartRouter;