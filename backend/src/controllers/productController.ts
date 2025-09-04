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
import { CategorySchema } from "../types/general.type";

export const getProductsQuerySchema = z
  .object({
    page: z.coerce.number().min(1).optional(), //return all products if there's no page
    size: z.coerce.number().min(1).max(30).optional(), //return all products if there's no size
    category: CategorySchema.optional(),
    priceMin: z.coerce.number().min(0).optional(),
    priceMax: z.coerce.number().min(0).max(100000000).optional(),
    name: z.string().optional(),
  })
  .strict()
  .refine(
    (q) => q.priceMin == null || q.priceMax == null || q.priceMax >= q.priceMin,
    { path: ["priceMax"], message: "priceMax must be >= priceMin" }
  );

type GetProductsQueryType = z.output<typeof getProductsQuerySchema>;

// Request < params type, response body, request body, request query
export const getProductsController = async (req: Request, res: Response) => {
  try {
    const { page, size, category, priceMin, priceMax, name } = (
      req as unknown as Record<string, unknown> & {
        validatedquery: GetProductsQueryType;
      }
    ).validatedquery;

    //To use pagination, page & size must be provided together
    const pagination =
      page !== undefined && size !== undefined ? { page, size } : undefined;

    const result = await ProductService.getCustomerProducts(pagination, {
      category,
      priceMax,
      priceMin,
      name,
    });

    if (result === null) {
      return ErrorJsonResponse(res, 500, "Failed to fetch products");
    }

    const { products, totalProducts } = result;

    //Count the page
    const totalPages = pagination?.size
      ? Math.max(1, Math.ceil(totalProducts / pagination.size))
      : 1;

    return SuccessJsonResponse(res, 200, {
      products,
      limit: products.length,
      totalProducts: totalProducts,
      totalPages,
      currentPage: pagination?.page ?? 1, //default 1
    });
  } catch (err: any) {
    if (err?.issues) {
      return ErrorJsonResponse(res, 400, err.issues[0].message);
    }
    console.log("getProductsController error: ", err);
    return ErrorJsonResponse(
      res,
      500,
      "Unexpected error while fetching products"
    );
  }
};

export const getVendorProductsController = async (
  req: Request,
  res: Response
) => {
  try {
    const vendorId = req.user_id;

    const { page, size, category, priceMin, priceMax, name } = (
      req as unknown as Record<string, unknown> & {
        validatedquery: GetProductsQueryType;
      }
    ).validatedquery;

    //To use pagination, page & size must be provided together
    const pagination =
      page !== undefined && size !== undefined ? { page, size } : undefined;

    const result = await ProductService.getVendorProducts(
      vendorId,
      pagination,
      { category, priceMax, priceMin, name }
    );

    if (result === null) {
      return ErrorJsonResponse(res, 500, "Failed to fetch products");
    }

    const { products, totalProducts } = result;

    //Count the page
    const totalPages = pagination?.size
      ? Math.max(1, Math.ceil(totalProducts / pagination.size))
      : 1;

    return SuccessJsonResponse(res, 200, {
      products,
      limit: products.length,
      totalProducts: totalProducts,
      totalPages,
      currentPage: pagination?.page ?? 1, //default 1
    });
  } catch (err: any) {
    if (err?.issues) {
      return ErrorJsonResponse(res, 400, err.issues[0].message);
    }
    console.log("getProductsController error: ", err);
    return ErrorJsonResponse(
      res,
      500,
      "Unexpected error while fetching products"
    );
  }
};

export const getProductByIdParamsSchema = z
  .object({
    productId: z.string(),
  })
  .strict();

type GetProductByIdParamsType = z.output<typeof getProductByIdParamsSchema>;

export const getProductByIdController = async (req: Request, res: Response) => {
  try {
    const userRole = req.user_role;
    const userId = req.user_id;
    const { productId } = (
      req as unknown as Record<string, unknown> & {
        validatedparams: GetProductByIdParamsType;
      }
    ).validatedparams;
    const vendorId = userRole === "vendor" ? userId : undefined;
    const product = await ProductService.getProductById(productId, {
      vendorId,
    });

    if (!product) {
      return ErrorJsonResponse(res, 404, "Product is not found");
    }
    return SuccessJsonResponse(res, 200, { product });
  } catch (err: any) {
    if (err?.issues) {
      return ErrorJsonResponse(res, 400, err.issues[0].message);
    }
    console.log("getProductsController error: ", err);
    return ErrorJsonResponse(
      res,
      500,
      "Unexpected error while fetching products"
    );
  }
};

type CreateProductBodyType = z.output<typeof createProductBodySchema>;

export const createProductBodySchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    price: z.coerce.number().min(0, "Price must be >= 0"),
    description: z
      .string()
      .trim()
      .min(1, "Description is required")
      .max(500, "Description must be at most 500 characters"),
    category: CategorySchema,
    instock: z.coerce.boolean().default(true),
  })
  .strict();

export const createProductController = async (req: Request, res: Response) => {
  try {
    const vendorId = req.user_id;
    const body = (
      req as unknown as Record<string, unknown> & {
        validatedbody: CreateProductBodyType;
      }
    ).validatedbody;
    const file = req.file;

    if (!file) {
      return ErrorJsonResponse(res, 400, "Image file is required");
    }

    const upload = await ImageService.uploadImage(file, "productimages");
    if (!upload.success) {
      return ErrorJsonResponse(
        res,
        500,
        upload.error ?? "Failed to upload image"
      );
    }

    const payload: ProductInsertNoId = {
      vendor_id: vendorId,
      ...body,
      image: upload.url!,
    };

    const created = await ProductService.createProduct(payload);
    if (!created) {
      return ErrorJsonResponse(res, 500, "Failed to create product");
    }
    return SuccessJsonResponse(res, 201, { product: created });
  } catch (err: any) {
    console.error("createProductController error:", err);
    if (err?.issues) {
      return ErrorJsonResponse(
        res,
        400,
        err.issues[0]?.message ?? "Validation failed"
      );
    }
    return ErrorJsonResponse(
      res,
      500,
      err?.message ?? "Unexpected error while creating product"
    );
  }
};

type UpdateProductBodyType = z.output<typeof updateProductStatusBodySchema>;

export const updateProductStatusBodySchema = z
  .object({
    name: z.string().trim().min(1).max(150).optional(),
    price: z.coerce.number().min(0).optional(),
    category: CategorySchema.optional(),
    description: z.string().trim().max(5000).optional(),
    instock: z.coerce.boolean().optional(),
  })
  .strict();

export const updateProductStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const vendorId = req.user_id;

    //Destruct object to take values
    const { productId } = (
      req as unknown as Record<string, unknown> & {
        validatedparams: GetProductByIdParamsType;
      }
    ).validatedparams;
    const { name, price, category, description, instock } = (
      req as unknown as Record<string, unknown> & {
        validatedbody: UpdateProductBodyType;
      }
    ).validatedbody;

    let newImagePath: string | undefined;

    if (req.file) {
      const up = await ImageService.uploadImage(req.file, "productimages");
      if (!up.success) {
        return ErrorJsonResponse(res, 500, up.error ?? "Image upload failed");
      }
      newImagePath = up.url!; // save as PATH
    }

    const { data: oldRow } = await supabase
      .from("products")
      .select("image")
      .eq("vendor_id", vendorId)
      .eq("id", productId)
      .maybeSingle();

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

    //If no fields is updated
    if (updated === "NO_FIELDS") {
      return ErrorJsonResponse(
        res,
        400,
        "No fields provided to update"
      );
    }

    //If wrong pro
    if (updated === "NOT_FOUND") {
      return ErrorJsonResponse(
        res,
        404,
        "Product not found or not owned by vendor"
      );
    }

    //Delete old image if there's a new one
    if (newImagePath && oldRow?.image && oldRow.image !== newImagePath) {
      await ImageService.deleteImage(oldRow.image, "productimages");
    }

    return SuccessJsonResponse(res, 200, { product: updated });
  } catch (err: any) {
    console.error("updateProductStatusController error:", err);
    if (err?.issues) {
      return ErrorJsonResponse(
        res,
        400,
        err.issues[0]?.message ?? "Validation failed"
      );
    }

    return ErrorJsonResponse(
      res,
      500,
      "Unexpected error while updating product status"
    );
  }
};
