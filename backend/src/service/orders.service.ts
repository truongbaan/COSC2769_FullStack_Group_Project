/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Nguyen The Anh
# ID: s3975844*/
import { supabase, Database } from "../db/db";
import { debugLog, debugError } from '../utils/debug';

export type OrderStatus = "active" | "delivered" | "canceled"; //Statuses of an order
export type Order = Database["public"]["Tables"]["orders"]["Row"]; //take the orders table from database

export type Pagination = {
  page: number;
  size: number;
};

export const OrderService = {
  //take the orders from write hub_id and return the orders in that hub
  async getOrders({ page, size }: Pagination, shipperId: string, status: OrderStatus[] = ["active"]): Promise<Order[] | null> {
    const offset = (page - 1) * size;

    const { data: distributionId, error: distributionErr } = await supabase //take the hub_id of shipper
      .from("shippers")
      .select("hub_id")
      .eq("id", shipperId)
      .maybeSingle();

    if (distributionErr) {
      debugError("Error fetching shipper hub:", distributionErr);
      throw new Error("DB_READ_FAILED");
    }

    const hubId = distributionId?.hub_id;
    if (!hubId) {
      //empty hub_id, return empty orders
      console.warn("No hub_id found for shipper:", shipperId);
    }

    // no hub_id -> return null
    if (!hubId) return [];

    let queryOrders = supabase.from("orders").select("*").eq("hub_id", hubId);

    //filter by status if provided
    if (status?.length) {
      queryOrders = queryOrders.in("status", status); // take all three statuses
    }

    const { data, error } = await queryOrders
      .order("id", { ascending: false })
      .range(offset, offset + size - 1);

    if (error) {
      debugError("Error fetching order:", error);
      throw error;
    }
    return data ?? null;
  },

  // UPDATE orders o JOIN shippers s ON s.hub_id = o.hub_id SET o.status = 'delivered' WHERE o.status = 'active' and s.shipper_id = {shipper}

  // update the status of an order only "active" status -> "delivered" or "canceled"
  async updateStatus(
    orderId: string,
    nextStatus: Exclude<OrderStatus, "active">,
    shipperId: string
  ): Promise<Order> {
    //take the current order same as orderId
    //check hub_id of shipper through user_id
    const { data: shipper, error: shipperError } = await supabase //take the hub_id of shipper
      .from("shippers")
      .select("hub_id")
      .eq("id", shipperId)
      .maybeSingle();

    if (shipperError) {
      debugError("Error fetching shipper hub:", shipperError);
      throw new Error("DB_READ_FAILED");
    }

    const hubId = shipper?.hub_id;
    if (!hubId) {
      // Can not find a shipper with the given shipper id
      throw new Error("NOT_FOUND");
    }

  const { data: order, error: readErr } = await supabase
    .from("orders")
    .select("id,status,hub_id")
    .eq("id", orderId)
    .eq("hub_id", hubId)
    .maybeSingle();

  if (readErr) {
    debugError("READ_ORDER_ERROR:", readErr);
    throw new Error("DB_READ_FAILED");
  }
  if (!order) throw new Error("NOT_FOUND");

  // 3) Nếu order đã finalize thì trả 409 ở controller
  if (order.status !== "active") {
    throw new Error("ALREADY_FINALIZED");
  }

    const { data, error: updErr } = await supabase
      .from('orders')
      .update({ status: nextStatus })
      .eq('id', orderId)
      .eq('status', 'active')
      .eq('hub_id', hubId)
      .select()
      .maybeSingle();
  
    
    if (updErr) {
      debugError("UPDATE_ERROR:", updErr); //Debugging purpose
      throw new Error("DB_WRITE_FAILED");
    }

    return data as Order;
  },
};
