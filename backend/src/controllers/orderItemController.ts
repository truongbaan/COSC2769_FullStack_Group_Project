import { z } from "zod"
import { type Request, type Response } from "express"
import { ErrorJsonResponse, SuccessJsonResponse } from "../utils/json_mes"
import { OrderItemService } from "../service/order_items.service"

export const getOrderItemsParamsSchema = z.object({
  id: z.string().min(1),
})

export async function getOrderItemsController(req: Request, res: Response) {
  try {
    const { id: orderId } = (req as any).validatedparams as z.infer<typeof getOrderItemsParamsSchema>
    const items = await OrderItemService.getByOrderId(orderId)
    return SuccessJsonResponse(res, 200, { order_id: orderId, items })
  } catch (e) {
    console.error(e)
    return ErrorJsonResponse(res, 500, "Failed to load order items")
  }
}
