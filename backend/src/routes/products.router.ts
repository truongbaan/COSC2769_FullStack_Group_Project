/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Nguyen Vo Truong Toan
# ID:  s3979056
*/

import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { validationMiddleware } from "../middleware/validation.middleware";
import { addToCartBodySchema, addToCartController } from "../controllers/shoppingCartController";

import {
  getProductsController,
  getProductsQuerrySchema,
} from "../controllers/productController";

import {createProductController,
  createProductParamsSchema,
  getProductByIdController,
  getProductByIdParamsSchema,
  updateProductStatusBodySchema,
  updateProductStatusController,
} from "../controllers/productController";

const ProductRouter = Router();

// Get products with pagination and fitlers
ProductRouter.get(
  "/",
  requireAuth(["vendor", "customer"]),
  validationMiddleware(getProductsQuerrySchema, "query"),
  getProductsController
);

ProductRouter.post(
  "/create",
  requireAuth("vendor"),
  validationMiddleware(createProductParamsSchema, "body"),
  createProductController
);

ProductRouter.patch(
  "/:productId/updateStatus",
  requireAuth("vendor"),
  validationMiddleware(updateProductStatusBodySchema, "body"),
  updateProductStatusController
);

// Get product details by id
ProductRouter.get(
  "/:productId",
  requireAuth("customer"),
  validationMiddleware(getProductByIdParamsSchema, "params"),
  getProductByIdController
);

//add product to shopping cart
ProductRouter.post(
  "/:productId/addToCart",
  requireAuth("customer"),
  validationMiddleware(addToCartBodySchema, "body"),
  addToCartController
)

export default ProductRouter;
