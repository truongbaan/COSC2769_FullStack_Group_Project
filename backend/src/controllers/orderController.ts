/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Nguyen The Anh
# ID: s3975844*/

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
    console.log("check user id: ", req.user_id)

    const { page, size } =
      (req as unknown as { validatedquery: GetOrdersQuerryType }).validatedquery;

    // take hub_id of the shipper through user_id
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
      //empty hub_id, return empty orders
      return SuccessJsonResponse(res, 200, {
        data: { orders: [], count: 0, page, size },
      });
    }

    // take the order from the specifice hub with the status "active"
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


const updateStatusParams = z.object({
  id: z.string().min(1),
}).strict()

const updateStatusBody = z.object({
  status: z.enum(["delivered", "canceled"]), //only 2 statuses can be updated to
}).strict()

export const updateOrderStatusController = async (req: Request, res: Response) => {
  try {
    if (!req.user_id) {
      return ErrorJsonResponse(res, 401, "Please login")
    }

    // Validate input
    const { id } = updateStatusParams.parse(req.params)
    const { status } = updateStatusBody.parse(req.body)

    //check hub_id of shipper through user_id
    const { data: shipper, error: shipperErr } = await supabase
      .from("shippers")
      .select("hub_id")
      .eq("id", req.user_id)
      .maybeSingle()

    if (shipperErr) {
      console.error("Error fetching shipper hub:", shipperErr)
      return ErrorJsonResponse(res, 500, "Failed to resolve shipper hub")
    }
    if (!shipper?.hub_id) {
      //Vendor or customer can not access
      return ErrorJsonResponse(res, 403, "Shipper only")
    }

    // 3) Update status: 'active' → 'delivered' | 'canceled'
    const updated = await OrderService.updateStatus(id, status, {
      restrictHubId: shipper.hub_id, // only allow update if order in this hub
    })

    return SuccessJsonResponse(res, 200, {
      message: "Order status updated",
      data: { order: updated },
    })
  } catch (err: any) {
    // dectect validation errors 
    if (err?.issues) {
      return ErrorJsonResponse(res, 400, err.issues[0]?.message ?? "Validation failed")
    }

    const msg = err instanceof Error ? err.message : "UNKNOWN"
    switch (msg) {
      case "NOT_FOUND":
        return ErrorJsonResponse(res, 404, "Order not found")
      case "ALREADY_FINALIZED":
        return ErrorJsonResponse(res, 409, "Order already finalized (delivered/canceled)")
      case "FORBIDDEN_HUB":
        return ErrorJsonResponse(res, 403, "Order not in your hub")
      case "CONFLICT":
        return ErrorJsonResponse(res, 409, "Conflict: order status changed by another action")
      case "DB_READ_FAILED":
      case "DB_WRITE_FAILED":
        return ErrorJsonResponse(res, 500, "Database error")
      default:
        console.error("Unexpected error in updateOrderStatusController:", err)
        return ErrorJsonResponse(res, 400, "Invalid request")
    }
  }
}
