// /* RMIT University Vietnam
// # Course: COSC2769 - Full Stack Development
// # Semester: 2025B
// # Assessment: Assignment 02
// # Author: Nguyen Vo Truong Toan
// # ID: s3979056 */

// import * as z from "zod";
// import { Request, Response } from "express";
// import { ProductService } from "../../service/products.service";
// import { ErrorJsonResponse, SuccessJsonResponse } from "../../utils/json_mes";

// export const getProductsByCategoryParamsSchema = z.object({
//     category: z.coerce.number().int().positive(),
// }).strict();

// export const getProductsByCategoryController = async (req: Request, res: Response) => {
//     const { category } = req.params;

//     const products = await ProductService.getProductsByCategory(category);
//     if (!products) {
//         return ErrorJsonResponse(res, 500, "Failed to fetch products by category");
//     }
//     if (products.length === 0) {
//         return ErrorJsonResponse(res, 404, "No products found for this category");
//     }

//     return SuccessJsonResponse(res, 200, {
//         data: { products, count: products.length },
//     });
// };