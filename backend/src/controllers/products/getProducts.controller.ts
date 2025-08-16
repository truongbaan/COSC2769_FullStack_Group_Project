import * as z from "zod";
import { Request, Response } from "express";
import { ProductService } from "../../service/products.service";
import { ErrorJsonResponse, SuccessJsonResponse } from "../../utils/json_mes";

export const getProductsQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    size: z.coerce.number().min(1).max(30).default(10),
    category: z.string().trim().max(100).optional(),
    min: z.coerce.number().min(0).optional(),
    max: z.coerce.number().min(0).max(1_000_000).optional(),
    // price: z.object({
    //     min: z.coerce.number().min(0).optional(),
    // //     max: z.coerce.number().min(0).max(1000000).optional(),
    // }).strict().optional()
    // }).strict(),
}).refine(
    (d) => d.min === undefined || d.max === undefined || d.min <= d.max,
    { message: "min must be <= max", path: ["min"] }
);


export const getProductsController = async (req: Request, res: Response) => {
    try {
        const parsed = getProductsQuerySchema.parse(req.query);
        const { page, size, category, min, max } = parsed;

        const products = await ProductService.getProducts(
            { page, size },
            { category, price: { min, max } }
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