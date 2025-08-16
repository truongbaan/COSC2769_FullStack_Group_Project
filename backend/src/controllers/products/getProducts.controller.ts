import * as z from "zod";
import { Request, Response } from "express";
import { ProductService } from "../../service/products.service";
import { ErrorJsonResponse, SuccessJsonResponse } from "../../utils/json_mes";

export const getProductsQuerySchema = z.object({
    page: z.number().min(1).default(1).optional(),
    size: z.number().min(1).max(30).default(10).optional(),
    category: z.string().trim().max(100).optional(),
    price: z.object({
        min: z.number().min(0).optional(),
        max: z.number().max(1000000).optional(),
    }).strict()
}).strict();

export const getProductsController = async (req: Request, res: Response) => {
    try {
        // Parse query params
        const parsed = getProductsQuerySchema.parse(req.query);

        const { page = 1, size = 10, category, price } = parsed;

        const products = await ProductService.getProducts(
            { page, size },
            { category, price }
        );
        // Nếu service trả null (lỗi phía DB)
        if (products === null) {
            return ErrorJsonResponse(res, 500, "Failed to fetch products");
        }

        // Thành công: trả danh sách + count
        return SuccessJsonResponse(res, 200, {
            data: {
                products,
                count: products.length,
            },
        });
    } catch (err) {
        return ErrorJsonResponse(res, 400, "Unexpected error while fetching products");
    }
};