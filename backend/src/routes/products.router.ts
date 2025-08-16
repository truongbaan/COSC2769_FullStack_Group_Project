/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: 
# ID:  */

import { Router, Request, Response } from 'express';
import { Product, ProductService } from '../service/products.service';
import { ErrorJsonResponse, SuccessJsonResponse } from '../utils/json_mes';
import { getProductByIdController, getProductByIdParamsSchema } from '../controllers/products/getProductById.controller';
import { validationMiddleware } from '../middleware/validation.middleware';
import { createProductBodySchema } from '../controllers/products/createProduct.controller';
import { deleteProductParamsSchema } from '../controllers/products/deleteProduct.controller';
import { getProductsController, getProductsQuerrySchema } from '../controllers/products/getProducts.controller';
import { id } from 'zod/v4/locales/index.cjs';

const ProductRouter = Router();

// Get products with pagination and fitlers
ProductRouter.get("/", validationMiddleware(getProductsQuerrySchema, 'query'), getProductsController);

// Get product details by id
ProductRouter.get("/:productId", validationMiddleware(getProductByIdParamsSchema, "params"), getProductByIdController);

// /** POST /products  (Add New Product) */
// ProductRouter.post('/', validationMiddleware(createProductBodySchema, 'body'),
//     async (req: Request, res: Response) => {
//         try {
//             const { name, price, image, description, category } = req.body;

//             const created = await ProductService.createProduct({
//                 name,
//                 price,
//                 image,
//                 description,
//                 category,
//             });

//             if (!created) {
//                 return ErrorJsonResponse(res, 400, 'Failed to create product');
//             }
//             return SuccessJsonResponse(res, 201, created);
//         } catch (error) {
//             return ErrorJsonResponse(res, 500, 'Failed to create product');
//         }
//     }
// );

// /** DELETE /products/:productId */
// ProductRouter.delete('/:productId', validationMiddleware(deleteProductParamsSchema, 'params'),
//     async (req: Request, res: Response) => {
//         try {
//             const { productId } = req.params;
//             const ok = await ProductService.deleteProduct(String(productId));

//             if (!ok) {
//                 return ErrorJsonResponse(res, 404, `product ${productId} not found or delete failed`);
//             }
//             return SuccessJsonResponse(res, 200, { deleted: true, id: productId });
//         } catch (error) {
//             return ErrorJsonResponse(res, 500, 'Failed to delete product');
//         }
//     }
// );

export default ProductRouter