/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Nguyen Vo Truong Toan
# ID: s3979056 */

import * as z from "zod";
import { Request, Response } from "express";
import { ProductInsert, ProductInsertNoId, ProductService } from "../service/products.service";
import { ErrorJsonResponse, SuccessJsonResponse } from "../utils/json_mes";
import generateUUID from "../utils/generator";

export const getProductsQuerrySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    size: z.coerce.number().min(1).max(30).default(10),
    category: z.string().trim().max(100).optional(),
    priceMin: z.coerce.number().min(0).optional(),
    priceMax: z.coerce.number().min(0).max(100000000).optional(),
    name: z.string().optional(),
}).strict();


type GetProductsQuerryType = z.output<typeof getProductsQuerrySchema>;

// Request < params type, response body, request body, request query
export const getProductsController = async (req: Request, res: Response) => {
    try {
        const { page, size, category, priceMin, priceMax, name } = (req as unknown as Record<string, unknown> & { validatedquery: GetProductsQuerryType }).validatedquery;

        const products = await ProductService.getProducts(
            { page, size },
            { category, priceMax, priceMin, name }
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

export const getProductByIdParamsSchema = z.object({
    productId: z.string(),
}).strict();

type GetProductByIdParams = z.output<typeof getProductByIdParamsSchema>;

export const getProductByIdController = async (req: Request, res: Response) => {
    const { productId } = (req as unknown as Record<string, unknown> & { validatedparams: GetProductByIdParams }).validatedparams;

    const product = await ProductService.getProductById(productId);

    if (!product) {
        return ErrorJsonResponse(res, 404, 'Product is not found');
    }

    return SuccessJsonResponse(res, 200, {
        data: {
            product
        }
    });
}

export const createProductParamsSchema = z.object({
    name: z.string().trim(),
    price: z.coerce.number().min(0),
    description: z.string().trim(),
    image: z.string().trim(),
    category: z.string().trim().min(1),
    instock: z.coerce.boolean(),
}).strict();

declare global {
    namespace Express {
        interface Request {
            validatedbody?: {
                name: string; price: number; description: string;
                image: string; category: string; instock: boolean;
            };
        }
    }
}

export const createProductController = async (req: Request, res: Response) => {
    const vendorId = req.user_id;
    if (!vendorId) return res.status(401).json({ message: "Unauthorized" });

    const body = req.validatedbody!; // do middleware set
    const payload: ProductInsertNoId = { vendor_id: vendorId, ...body };

    const created = await ProductService.createProduct(payload);
    if (!created) return res.status(500).json({ message: "Failed to create product" });
    return res.status(201).json({ data: { product: created } });
};