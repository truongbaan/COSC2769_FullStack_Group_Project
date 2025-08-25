/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Nguyen Vo Truong Toan
# ID:  s3979056
*/

import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/requireAuth";
import { validationMiddleware } from "../middleware/validation.middleware";
import { addToCartBodySchema, addToCartController } from "../controllers/shoppingCartController";

import {
  createProductBodySchema,
  getProductsController,
  getProductsQuerySchema,
} from "../controllers/productController";

import {
  createProductController,
  // deleteProductController,
  getProductByIdController,
  getProductByIdParamsSchema,
  updateProductStatusBodySchema,
  updateProductStatusController,
} from "../controllers/productController";

const upload = multer();

const ProductRouter = Router();

// Customer/ Vendor get products with pagination and fitlers
ProductRouter.get(
  "/",
  requireAuth(["vendor", "customer"]),
  validationMiddleware(getProductsQuerySchema, "query"),
  getProductsController
);

// Get product details by id
ProductRouter.get(
  "/:productId",
  requireAuth("customer"),
  validationMiddleware(getProductByIdParamsSchema, "params"),
  getProductByIdController
);

ProductRouter.post(
  "/",
  requireAuth("vendor"),
  upload.single("image"),
  validationMiddleware(createProductBodySchema, "body"),
  createProductController
);

// Customer add product to shopping cart
ProductRouter.post(
  "/:productId/addToCart",
  requireAuth("customer"),
  validationMiddleware(addToCartBodySchema, "body"),
  addToCartController
)

ProductRouter.patch(
  "/:productId",
  requireAuth("vendor"),
  upload.single("image"),
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
