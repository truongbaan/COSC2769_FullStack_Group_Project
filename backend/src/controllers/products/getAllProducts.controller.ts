import * as z from "zod";
import { Request, Response } from "express";
import { ProductService } from "../../service/products.service";
import { ErrorJsonResponse, SuccessJsonResponse } from "../../utils/json_mes";

export const getAllProductsController = async (_req: Request, res: Response) => {
    try {
        const products = await ProductService.getAllProducts();
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
        return ErrorJsonResponse(res, 500, "Unexpected error while fetching products");
    }
};