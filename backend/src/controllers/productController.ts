/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Nguyen Vo Truong Toan
# ID: s3979056 */

import * as z from "zod";
import { Request, Response } from "express";
import { ProductInsertNoId, ProductService } from "../service/products.service";
import { ErrorJsonResponse, SuccessJsonResponse } from "../utils/json_mes";
import { ImageService } from "../service/image.service";
import { supabase } from "../db/db";

export const getProductsQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    size: z.coerce.number().min(1).max(30).default(10),
    category: z.string().trim().max(100).optional(),
    priceMin: z.coerce.number().min(0).optional(),
    priceMax: z.coerce.number().min(0).max(100000000).optional(),
    name: z.string().optional(),
}).strict()
    .refine(
        q => q.priceMin == null || q.priceMax == null || q.priceMax >= q.priceMin,
        { path: ["priceMax"], message: "priceMax must be >= priceMin" }
    );

type GetProductsQueryType = z.output<typeof getProductsQuerySchema>;

// Request < params type, response body, request body, request query
export const getProductsController = async (req: Request, res: Response) => {
    try {
        const userRole = req.user_role;
        const { page, size, category, priceMin, priceMax, name } = (req as unknown as Record<string, unknown> & { validatedquery: GetProductsQueryType }).validatedquery;

        if (userRole === "customer") {
            const products = await ProductService.getCustomerProducts(
                { page, size },
                { category, priceMax, priceMin, name }
            );

            if (products === null) {
                return ErrorJsonResponse(res, 500, "Failed to fetch products");
            }

            return SuccessJsonResponse(res, 200, {
                data: { products, count: products.length },
            });
        }
        else if (userRole === "vendor") {
            const vendorId = req.user_id;

            const products = await ProductService.getVendorProducts(
                { page, size }, vendorId,
            )

            if (products === null) {
                return ErrorJsonResponse(res, 500, "Failed to fetch products");
            }

            return SuccessJsonResponse(res, 200, {
                data: { products, count: products.length },
            });
        }

        return res.status(403).json({ message: "Forbidden: missing or invalid role" });


    } catch (err: any) {
        if (err?.issues) {
            return ErrorJsonResponse(res, 400, err.issues[0].message);
        }
        console.log('getProductsController error: ', err);
        return ErrorJsonResponse(res, 500, "Unexpected error while fetching products");
    }
}

export const getProductByIdParamsSchema = z.object({
    productId: z.string(),
}).strict();

type GetProductByIdParamsType = z.output<typeof getProductByIdParamsSchema>;

export const getProductByIdController = async (req: Request, res: Response) => {
    const { productId } = (req as unknown as Record<string, unknown> & { validatedparams: GetProductByIdParamsType }).validatedparams;

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

type CreateProductBodyType = z.output<typeof createProductBodySchema>;

export const createProductBodySchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    price: z.coerce.number().min(0),
    description: z.string().trim().min(1, "Description is required"),
    category: z.string().trim().min(1),
    instock: z.coerce.boolean(),
}).strict();

export const createProductController = async (req: Request, res: Response) => {
    try {
        const vendorId = req.user_id;
        const body = (req as unknown as Record<string, unknown> & { validatedbody: CreateProductBodyType }).validatedbody;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "Image file is required" });
        }

        const upload = await ImageService.uploadImage(file, "productimages");
        if (!upload.success) {
            return res.status(500).json({ message: upload.error });
        }

        const payload: ProductInsertNoId = {
            vendor_id: vendorId, ...body, image: upload.url!,
        };

        const created = await ProductService.createProduct(payload);
        if (!created)
            res.status(500).json({ message: "Failed to create product" });

        return SuccessJsonResponse(res, 201, {
            data: { product: created },
        });

    } catch (err: any) {
        console.error("createProductController error:", err);
        return ErrorJsonResponse(
            res, 500, err?.message ?? "Unexpected error while creating product"
        );
    }
};

type UpdateProductBodyType = z.output<typeof updateProductStatusBodySchema>;

export const updateProductStatusBodySchema = z.object({
    name: z.string().trim().min(1).max(150).optional(),
    price: z.coerce.number().min(0).optional(),
    category: z.string().trim().min(1).max(100).optional(),
    description: z.string().trim().max(5000).optional(),
    instock: z.coerce.boolean().optional(),
}).strict();

export const updateProductStatusController = async (req: Request, res: Response) => {
    try {
        const vendorId = req.user_id;

        //Destruct object to take values
        const { productId } = (req as unknown as Record<string, unknown> & { validatedparams: GetProductByIdParamsType }).validatedparams;
        const { name, price, category, description, instock } = (req as unknown as Record<string, unknown> & { validatedbody: UpdateProductBodyType }).validatedbody;

        let newImagePath: string | undefined;

        if (req.file) {
            const up = await ImageService.uploadImage(req.file, "productimages");
            if (!up.success) return res.status(500).json({ message: up.error });
            newImagePath = up.url!; // save as PATH
        }

        // (Optional) lấy product cũ để biết path ảnh hiện tại — dùng để delete sau khi update
        const { data: oldRow } = await supabase
            .from("products").select("image").eq("vendor_id", vendorId).eq("id", productId).maybeSingle();

        const updated = await ProductService.updateProduct(
            vendorId,
            productId,
            name,
            price,
            category,
            description,
            newImagePath,
            instock
        );

        if (!updated) {
            return res.status(404).json({ message: "Product not found or not owned by vendor" });
        }

        // Xoá ảnh cũ nếu có ảnh mới và ảnh cũ tồn tại
        if (newImagePath && oldRow?.image && oldRow.image !== newImagePath) {
            await ImageService.deleteImage(oldRow.image, "productimages");
        }

        return SuccessJsonResponse(res, 200, {
            message: "Update Status Success",
            product: updated,

        });

    } catch (err: any) {
        console.error("updateProductStatusController error:", err);
        return res.status(500).json({
            message: "Internal Server Error",
            detail: err.message ?? "Unexpected error while updating product status",
        });
    }
};