/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: 
# ID:  */

import { Router, Request, Response } from "express";
import { ProductRow, ProductService } from "../service/products.service";
import { ErrorJsonResponse, SuccessJsonResponse } from "../utils/json_mes";
import {
  createProductController,
  createProductParamsSchema,
  getProductByIdController,
  getProductByIdParamsSchema,
} from "../controllers/productController";
import { validationMiddleware } from "../middleware/validation.middleware";
import {
  getProductsController,
  getProductsQuerrySchema,
} from "../controllers/productController";
import { requireAuth } from "../middleware/requireAuth";
import { id } from "zod/v4/locales/index.cjs";
import { addToCartBodySchema, addToCartController } from "../controllers/shoppingCartController";

const ProductRouter = Router();

// Get products with pagination and fitlers
ProductRouter.get(
  "/",
  validationMiddleware(getProductsQuerrySchema, "query"),
  getProductsController
);

ProductRouter.post(
  "/create",
  requireAuth("vendor"),
  validationMiddleware(createProductParamsSchema, "body"),
  createProductController
);

// Get product details by id
ProductRouter.get(
  "/:productId",
  validationMiddleware(getProductByIdParamsSchema, "params"),
  getProductByIdController
);

//add product to shopping cart
ProductRouter.post(
  "/:productId/addToCart",
  validationMiddleware(addToCartBodySchema, "body"),
  addToCartController
)

export default ProductRouter;
