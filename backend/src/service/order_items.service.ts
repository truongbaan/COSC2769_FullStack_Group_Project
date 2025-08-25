/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Nguyen The Anh
# ID: s3975844 */

import { supabase, Database } from "../db/db";
import { ImageService } from "./image.service";

type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];
type ProductRow   = Database["public"]["Tables"]["products"]["Row"];

export type OrderItemWithProduct = {
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price_at_order_time: number;
  total: number;
  image: string | null;
};

export type OrderCustomer = { name: string; address: string };

const IMAGE_BUCKET = "productimages" as const;

export const OrderItemService = {
  async getCustomerNameAndAddressByOrderId(orderId: string): Promise<OrderCustomer | null> {
    // take the customer id from the order
    const { data: ord, error: errOrd } = await supabase
      .from("orders")
      .select("customer_id")
      .eq("id", orderId)
      .maybeSingle();
    if (errOrd) throw errOrd;
    if (!ord?.customer_id) return null;

    // take the addresst and name of customer
    const { data: cust, error: errCust } = await supabase
      .from("customers")
      .select("name, address")
      .eq("id", ord.customer_id as string)
      .maybeSingle();
    if (errCust) throw errCust;
    if (!cust) return null;

    return { name: cust.name as string, address: cust.address as string };
  },

  async getItemsByOrderId(orderId: string): Promise<OrderItemWithProduct[]> {
    const { data: items, error: errItems } = await supabase
      .from("order_items")
      .select("order_id, product_id, quantity, price_at_order_time")
      .eq("order_id", orderId)
      .order("id", { ascending: false });

    if (errItems) throw errItems;
    if (!items || items.length === 0) return [];

    // take the product name and image 
    const productIds = [...new Set(items.map((i) => i.product_id))];
    const { data: products, error: errProds } = await supabase
      .from("products")
      .select("id, name, image")
      .in("id", productIds);
    if (errProds) throw errProds;


    const prodMap = new Map<string, Pick<ProductRow, "name" | "image">>();
    (products ?? []).forEach((p) => {
      prodMap.set(p.id as string, { name: p.name as string, image: (p.image as string) ?? null });
    });

    // merge + build image_url
    return (items as OrderItemRow[]).map((i) => {
      const p = prodMap.get(i.product_id) ?? { name: "(unknown product)", image: null as string | null };

      let image: string | null = null;
      if (p.image) {
        const r = ImageService.getPublicImageUrl(p.image, IMAGE_BUCKET as any);
        image = r.success ? (r.url ?? null) : null;
      }

      const qty = Number(i.quantity ?? 0);
      const price = Number(i.price_at_order_time ?? 0);

      return {
        order_id: i.order_id,
        product_id: i.product_id,
        product_name: p.name,
        quantity: qty,
        price_at_order_time: price,
        total: qty * price,
        image,
      };
    });
  },
};