"use strict";
/* RMIT University Vietnam
# Course: COSC2769 - Full Stack Development
# Semester: 2025B
# Assessment: Assignment 02
# Author:
# ID:  */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const products_service_1 = require("../service/products.service");
const json_mes_1 = require("../utils/json_mes");
const getProductById_controller_1 = require("../controllers/products/getProductById.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const createProduct_controller_1 = require("../controllers/products/createProduct.controller");
const getProducts_controller_1 = require("../controllers/products/getProducts.controller");
const ProductRouter = (0, express_1.Router)();
// GET /products
// Get products with pagination and fitlers
ProductRouter.get("/", (0, validation_middleware_1.validationMiddleware)(getProducts_controller_1.getProductsQuerySchema, 'query'), getProducts_controller_1.getProductsController);
// Get product details by id
ProductRouter.get("/:productId", (0, validation_middleware_1.validationMiddleware)(getProductById_controller_1.getProductByIdParamsSchema, "params"), getProductById_controller_1.getProductByIdController);
// // Get by category
// ProductRouter.get("/category/:category", validationMiddleware(getProductsByCategoryParamsSchema, "params"), getProductsByCategoryController);
// // Get by id
// ProductRouter.get("/:productId", validationMiddleware(getProductByIdParamsSchema, "params"), getProductByIdController);
// // Get all
// ProductRouter.get("/", getProductsController);
/** POST /products  (Add New Product) */
ProductRouter.post('/', (0, validation_middleware_1.validationMiddleware)(createProduct_controller_1.createProductBodySchema, 'body'), async (req, res) => {
    try {
        const { name, price, image, description, category } = req.body;
        const created = await products_service_1.ProductService.createProduct({
            name,
            price,
            image,
            description,
            category,
        });
        if (!created) {
            return (0, json_mes_1.ErrorJsonResponse)(res, 400, 'Failed to create product');
        }
        return (0, json_mes_1.SuccessJsonResponse)(res, 201, created);
    }
    catch (error) {
        return (0, json_mes_1.ErrorJsonResponse)(res, 500, 'Failed to create product');
    }
});
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
exports.default = ProductRouter;
