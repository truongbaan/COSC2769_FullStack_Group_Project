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
  // deleteProductController,
  getProductByIdController,
  getProductByIdParamsSchema,
  updateProductStatusBodySchema,
  updateProductStatusController,
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

// Customer/ Vendor get products with pagination and fitlers
ProductRouter.get(
  "/",
  requireAuth(["vendor", "customer"]),
  validationMiddleware(getProductsQuerrySchema, "query"),
  getProductsController
);

// Get product details by id
ProductRouter.get(
  "/:productId",
  requireAuth("customer"),
  validationMiddleware(getProductByIdParamsSchema, "params"),
  getProductByIdController
);

// Customer add product to shopping cart
ProductRouter.post(
  "/:productId/addToCart",
  requireAuth("customer"),
  validationMiddleware(addToCartBodySchema, "body"),
  addToCartController
)

ProductRouter.patch(
  "/:productId/updateStatus",
  requireAuth("vendor"),
  validationMiddleware(getProductByIdParamsSchema, "params"),
  validationMiddleware(updateProductStatusBodySchema, "body"),
  updateProductStatusController
);

// // Vendor delete a product 
// ProductRouter.delete(
//   "/:productId",
//   requireAuth("vendor"),
//   validationMiddleware(getProductByIdParamsSchema, "params"),
//   deleteProductController
// );

export default ProductRouter;
