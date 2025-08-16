/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: 
# ID:  */

import * as z from "zod";
import { Request, Response } from "express";
import { ProductService } from "../../service/products.service";
import { ErrorJsonResponse, SuccessJsonResponse } from "../../utils/json_mes";

export const getProductsQuerrySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    size: z.coerce.number().min(1).max(30).default(10),
    category: z.string().trim().max(100).optional(),
    priceMin: z.coerce.number().min(0).optional(), // 10000
    priceMax: z.coerce.number().min(0).max(100000000).optional(), // 0
}).strict();

type GetProductsQuerryType = z.output<typeof getProductsQuerrySchema>;


// Request < params type, response body, request body, request query 
export const getProductsController = async (req: Request, res: Response) => {
    try {
        const { page, size, category, priceMin, priceMax } = (req as unknown as Record<string, unknown> & { validatedquery: GetProductsQuerryType }).validatedquery;

        const products = await ProductService.getProducts(
            { page, size },
            { category, priceMax, priceMin }
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
        console.log('ERRRRR: ', err);
        return ErrorJsonResponse(res, 500, "Unexpected error while fetching products");
    }
};


