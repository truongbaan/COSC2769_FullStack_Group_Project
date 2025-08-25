/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Nguyen The Anh
# ID: s3975844 */

import { z } from "zod"
import { type Request, type Response } from "express"
import { OrderItemService } from "../service/order_items.service"
import { ErrorJsonResponse, SuccessJsonResponse } from "../utils/json_mes"

export const getOrderItemsParamsSchema = z.object({
  id: z.string().min(1), // order_id
});
type GetParams = z.infer<typeof getOrderItemsParamsSchema>;

export async function getOrderItemsController(req: Request, res: Response) {
  try {
    const { id } = (req as unknown as { validatedparams: GetParams }).validatedparams;

    const [items, customer] = await Promise.all([
      OrderItemService.getItemsByOrderId(id),
      OrderItemService.getCustomerNameAndAddressByOrderId(id),
    ]);

    return SuccessJsonResponse(res, 200, {
      order_id: id,
      customer,            // { name, address } | null
      items,               // mỗi item có image_url
      count: items.length,
    });
  } catch (e) {
    console.error(e);
    return ErrorJsonResponse(res, 500, "Failed to load order items");
  }
}
