/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Nguyen The Anh
# ID: s3975844*/

import { z } from "zod"
import { type Request, type Response } from "express"
import { ShoppingCartService } from "../service/shopping_carts.service"
import { ErrorJsonResponse, SuccessJsonResponse } from "../utils/json_mes"

export const getCartQuerrySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  size: z.coerce.number().min(1).max(30).default(10),
}).strict()

type GetCartQuerryType = z.output<typeof getCartQuerrySchema>

export const getCartController = async (req: Request, res: Response) => {
  try {
    const {page, size} = (req as unknown as Record<string, unknown> & { validatedquery: GetCartQuerryType }).validatedquery;
    const customerId = req.user_id;

    const items = await ShoppingCartService.getCart({ page, size }, customerId);

    if (items === null) {
      return ErrorJsonResponse(res, 500, "Failed to fetch shopping cart");
    }
    return SuccessJsonResponse(res, 200, {
      items,
      count: items.length,
      page,
      size,
    });
  } catch (err: any) {
    if (err?.issues) {
      return ErrorJsonResponse(res, 400, err.issues?.[0]?.message ?? "Validation failed");
    }
    console.log("ERR getCart:", err);
    return ErrorJsonResponse(res, 500, "Unexpected error while fetching cart");
  }
};

type RemoveProductByIdParams = z.output<typeof removeByIdParamsSchema>

// Delete cart item by id
export const removeByIdParamsSchema = z.object({
  id: z.string().min(1),
}).strict();

export async function removeCartItemByIdController(req: Request, res: Response) {
  try {
    const userId = req.user_id; //user_id of customer

    const { id } = (req as unknown as Record<string, unknown> & { validatedparams: RemoveProductByIdParams }).validatedparams;

    const removed = await ShoppingCartService.removeItemById(id, userId);
    if (!removed) return ErrorJsonResponse(res, 404, "Cart item not found");

    return SuccessJsonResponse(res, 200, { data: { removed: true, id } });
  } catch (err: any) {
    const msg = err?.message?.startsWith("Unauthorized") ? err.message : "Failed to delete cart item";
    return ErrorJsonResponse(res, msg.startsWith("Unauthorized") ? 401 : 500, msg);
  }
}

export const addToCartParams = z.object({
  productId: z.string().min(1),           
}).strict();


export const addToCartBody = z.object({
  quantity: z.coerce.number().int().min(1).default(1),
}).default({ quantity: 1 });




type AddToCartParamsType = z.output<typeof addToCartParams>;
type AddToCartBodyType   = z.output<typeof addToCartBody>;

export async function addToCartController(req: Request, res: Response) {
  try {
    const { productId } = (req as unknown as Record<string, unknown> & { validatedparams: AddToCartParamsType }).validatedparams;
    const { quantity } = (req as unknown as Record<string, unknown> & { validatedbody: AddToCartBodyType }).validatedbody;
    
    const customerId = req.user_id;

    const item = await ShoppingCartService.addToCart(customerId, productId, quantity);
    return SuccessJsonResponse(res, 200, { item });
  } catch (e: any) {
    console.error("ADD_CART_ERROR:", e);
    return ErrorJsonResponse(res, e.status ?? 500, e.message ?? "ADD_CART_FAILED");
  }
}


export async function checkoutController(req: Request, res: Response) {
  try {
    const customerId = req.user_id; // user_id of customer

    const result = await ShoppingCartService.checkout(customerId as string)

    return SuccessJsonResponse(res, 201, {
      message: "Checkout success",
      order: {
        id: result.orderId,
        hub_id: result.hubId,
        status: "active",
        total_price: result.total,
      },
    })
  } catch (err) {
    console.error(err)
    return ErrorJsonResponse(res, 500, (err as Error).message)
  }
}