/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Nguyen The Anh
# ID: s3975844 */

import { z } from "zod"
import { type Request, type Response } from "express"
import { ErrorJsonResponse, SuccessJsonResponse } from "../utils/json_mes"
import { OrderItemService } from "../service/order_items.service"

export const getOrderItemsParamsSchema = z.object({
  id: z.string().min(1),
})

type getOrderItemsParamsType = z.output<typeof getOrderItemsParamsSchema>;

export async function getOrderItemsController(req: Request, res: Response) {
  try {
    const { id } = (req as unknown as Record<string, unknown> & { validatedparams: getOrderItemsParamsType }).validatedparams;

    const items = await OrderItemService.getByOrderId(id)
    const customerInfo = await OrderItemService.getCustomerNameAndAddressByOrderId(id)
    const customerName = customerInfo.length > 0 ? customerInfo[0].name : "(unknown customer)";
    const customerAddress = customerInfo.length > 0 ? customerInfo[0].address : "(unknown address)";


    return SuccessJsonResponse(res, 200, { order_id: id, customerName, customerAddress, items })
  } catch (e) {
    console.error(e)
    return ErrorJsonResponse(res, 500, "Failed to load order items")
  }
}
