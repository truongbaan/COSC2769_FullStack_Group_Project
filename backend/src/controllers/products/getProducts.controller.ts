/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Nguyen Vo Truong Toan
# ID: s3979056 */

import * as z from "zod";
import { Request, Response } from "express";
import { ProductService } from "../../service/products.service";
import { ErrorJsonResponse, SuccessJsonResponse } from "../../utils/json_mes";

// export const getProductsQuerySchema = z.object({
//     page: z.coerce.number().min(1).default(1),
//     size: z.coerce.number().min(1).max(30).default(10),
//     category: z.string().trim().max(100).optional(),
//     min: z.coerce.number().min(0).optional(),
//     max: z.coerce.number().min(0).max(1_000_000).optional(),
//     // price: z.object({
//     //     min: z.coerce.number().min(0).optional(),
//     // //     max: z.coerce.number().min(0).max(1000000).optional(),
//     // }).strict().optional()
//     // }).strict(),
// }).refine(
//     (d) => d.min === undefined || d.max === undefined || d.min <= d.max,
//     { message: "min must be <= max", path: ["min"] }
// );

export const getProductsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    size: z.coerce.number().int().min(1).max(30).default(10),
    category: z.string().trim().max(100).optional(),
    min: z.coerce.number().min(0).optional(),
    max: z.coerce.number().min(0).max(1_000_000).optional(),
}).refine(
    (d) => d.min === undefined || d.max === undefined || d.min <= d.max,
    { message: "min must be <= max", path: ["min"] }
);

export const getProductsController = async (req: Request, res: Response) => {
    try {
        const { page, size, category, min, max } = getProductsQuerySchema.parse(req.query);

        const products = await ProductService.getProducts(
            { page, size },
            { category, price: { min, max } }
        );

        if (products === null) {
            return ErrorJsonResponse(res, 500, "Failed to fetch products");
        }

        return SuccessJsonResponse(res, 200, {
            data: { products, count: products.length },
        });
    } catch (err: any) {
        if (err?.issues) {
            return ErrorJsonResponse(res, 400, err.issues[0].message);
        }
        return ErrorJsonResponse(res, 500, "Unexpected error while fetching products");
    }
};


