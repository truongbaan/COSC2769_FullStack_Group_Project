// src/controllers/shoppingCart.controller.ts
import { z } from "zod"
import { type Request, type Response } from "express"
import { ErrorJsonResponse, SuccessJsonResponse } from "../utils/json_mes"
import { ShoppingCartService } from "../service/shopping_carts.service"

export const getCartQuerrySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  size: z.coerce.number().min(1).max(30).default(10),
}).strict()

type GetCartQuerryType = z.output<typeof getCartQuerrySchema>

export const getCartController = async (req: Request, res: Response) => {
  try {
    if (!req.user_id) {
      return ErrorJsonResponse(res, 401, "Please login")
    }

    const { page, size } =
      (req as unknown as { validatedquery: GetCartQuerryType }).validatedquery

    const items = await ShoppingCartService.getCart({ page, size }, req.user_id)

    if (items === null) {
      return ErrorJsonResponse(res, 500, "Failed to fetch shopping cart")
    }

    return SuccessJsonResponse(res, 200, {
      data: { items, count: items.length, page, size },
    })
  } catch (err: any) {
    if (err?.issues) {
      return ErrorJsonResponse(res, 400, err.issues[0]?.message ?? "Validation failed")
    }
    console.log("ERR getCart:", err)

    // throw error 500 of database
    return ErrorJsonResponse(res, 500, "Unexpected error while fetching cart")
  }
}
