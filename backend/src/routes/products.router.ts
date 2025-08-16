/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Nguyen Vo Truong Toan
# ID: s3979056 */

import { Router, Request, Response } from 'express';
import { Product, ProductService } from '../service/products.service';
import { ErrorJsonResponse, SuccessJsonResponse } from '../utils/json_mes';
import { getProductByIdController, getProductByIdParamsSchema } from '../controllers/products/getProductById.controller';
import { validationMiddleware } from '../middleware/validation.middleware';
import { createProductBodySchema } from '../controllers/products/createProduct.controller';
import { deleteProductParamsSchema } from '../controllers/products/deleteProduct.controller';
// import { getProductsByCategoryController, getProductsByCategoryParamsSchema } from '../controllers/products/getProductByCategory.controller';
import { getProductsController, getProductsQuerySchema } from '../controllers/products/getProducts.controller';
import { id } from 'zod/v4/locales/index.cjs';

const ProductRouter = Router();

ProductRouter.get("/", async (req, res) => {
    try {
        const { page, size, category, min, max } = getProductsQuerySchema.parse(req.query);

        const price = (min !== undefined || max !== undefined) ? { min, max } : undefined;

        const products = await ProductService.getProducts({ page, size }, { category, price });

        return SuccessJsonResponse(res, 200, {
            data: { products: products ?? [], count: products?.length ?? 0, page, size },
        });
    } catch (err: any) {
        if (err?.issues?.length) return ErrorJsonResponse(res, 400, err.issues[0].message);
        console.error(err);
        return ErrorJsonResponse(res, 500, "Failed to fetch product(s)");
    }
});

ProductRouter.get("/:id", async (req, res) => {
    try {
        const id = String(req.params.id);
        const products = await ProductService.getProductById(id);

        if (products === null) {
            return ErrorJsonResponse(res, 500, "Failed to fetch products");
        }

        return SuccessJsonResponse(res, 200, {
            data: { products, count: products },
        });
    } catch (err: any) {
        if (err?.issues) {
            return ErrorJsonResponse(res, 400, err.issues?.[0]?.message || "Invalid query parameters");
        }
        return ErrorJsonResponse(res, 500, "Failed to fetch product(s)");
    }
});
// // Get by category
// ProductRouter.get("/category/:category", validationMiddleware(getProductsByCategoryParamsSchema, "params"), getProductsByCategoryController);

// // Get by id
// ProductRouter.get("/:productId", validationMiddleware(getProductByIdParamsSchema, "params"), getProductByIdController);

// // Get all
// ProductRouter.get("/", getProductsController);

/** POST /products  (Add New Product) */
ProductRouter.post('/', validationMiddleware(createProductBodySchema, 'body'),
    async (req: Request, res: Response) => {
        try {
            const { name, price, image, description, category } = req.body;

            const created = await ProductService.createProduct({
                name,
                price,
                image,
                description,
                category,
            });

            if (!created) {
                return ErrorJsonResponse(res, 400, 'Failed to create product');
            }
            return SuccessJsonResponse(res, 201, created);
        } catch (error) {
            return ErrorJsonResponse(res, 500, 'Failed to create product');
        }
    }
);

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