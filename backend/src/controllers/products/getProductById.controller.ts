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

export const getProductByIdParamsSchema = z.object({
    productId: z.string(),
}).strict();

type GetProductByIdParams = z.output<typeof getProductByIdParamsSchema>;

export const getProductByIdController = async (req: Request, res: Response) => {
   const { productId }  = (req as unknown as Record<string, unknown> & { validatedparams: GetProductByIdParams }).validatedparams;

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