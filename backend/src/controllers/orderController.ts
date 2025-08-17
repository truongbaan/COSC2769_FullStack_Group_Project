/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: 
# ID:  */

import { z } from "zod";
import { type Request, type Response } from "express";
import { ErrorJsonResponse, SuccessJsonResponse } from "../utils/json_mes";
import { OrderService } from "../service/orders.service";
import { supabase } from "../db/db";

export const getOrdersQuerrySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  size: z.coerce.number().min(1).max(30).default(10),
}).strict();

type GetOrdersQuerryType = z.output<typeof getOrdersQuerrySchema>;

export const getOrdersController = async (req: Request, res: Response) => {
  try {
    //check req
    console.log("++++++++++++++req++++++++++++++++++++++++++++", req.user_id)

    const { page, size } =
      (req as unknown as { validatedquery: GetOrdersQuerryType }).validatedquery;

    // 2) Tra hub_id của shipper theo user_id
    const { data: shipper, error: shipperErr } = await supabase
      .from("shippers")
      .select("hub_id")
      .eq("id", req.user_id)
      .maybeSingle();

    if (shipperErr) {
      console.error("Error fetching shipper hub:", shipperErr);
      return ErrorJsonResponse(res, 500, "Failed to resolve shipper hub");
    }

    const hubId = shipper?.hub_id;
    if (!hubId) {
      // Không có hub gắn với shipper hiện tại
      return SuccessJsonResponse(res, 200, {
        data: { orders: [], count: 0, page, size },
      });
    }

    // 3) Lấy orders theo hub hiện tại (status='active' đã được service lọc)
    const orders = await OrderService.getOrders({ page, size }, hubId);

    if (orders === null) {
      return ErrorJsonResponse(res, 404, "No orders found");
    }

    return SuccessJsonResponse(res, 200, {
      data: {
        orders,
        count: orders.length,
        page,
        size,
      },
    });
  } catch (err: any) {
    if (err?.issues) {
      return ErrorJsonResponse(res, 400, err.issues[0].message);
    }
    console.log("ERRRRR: ", err);
    return ErrorJsonResponse(res, 500, "Unexpected error while fetching orders");
  }
};

