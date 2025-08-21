/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Nguyen The Anh
# ID: s3975844*/
import { id } from "zod/v4/locales/index.cjs";
import { supabase, Database } from "../db/db";
import generateUUID from "../utils/generator";

export type Pagination = { page: number; size: number };

type CartRow = Database["public"]["Tables"]["shopping_carts"]["Row"];
type PublicCartItem = Omit<CartRow, "customer_id">;

class HttpError extends Error { 
  constructor(public status: number, msg: string){ super(msg) } 
}

export type CartItemDetail = {
  id: string;
  product_id: string;
  quantity: number;
  name: string;
  price: number;
  subtotal: number;
  image_url?: string | null;
};

export const ShoppingCartService = {
  async getCart(
    { page, size }: Pagination,
    customerId: string
  ): Promise<PublicCartItem[] | null> {
    const offset = (page - 1) * size;

    if (!customerId) return []; // no user -> null

    //take the data from shopping_carts by customer_id
    const { data, error } = await supabase
      .from("shopping_carts")
      .select("*")
      .eq("customer_id", customerId)
      .order("id", { ascending: false })
      .range(offset, offset + size - 1);

    if (error) {
      console.error("Cart read error:", error);
      throw new Error("DB_READ_FAILED");
    }
    return (data ?? []).map(({ customer_id, ...rest }) => rest);
  },
  async deleteItemById(id: string, customerId: string): Promise<boolean> {
    //delete by product_id and customer_id (verify the customer)
    const { data, error } = await supabase
      .from("shopping_carts")
      .delete()
      .eq("product_id", id)
      .eq("customer_id", customerId)
      .select("id"); 

    if (error) throw error;
    return (data?.length ?? 0) > 0;
  },
  async addToCart(
    customerId: string,
    { product_id, quantity }: { product_id: string; quantity: number }
  ): Promise<CartRow> {
   
    const { data: product, error: pErr } = await supabase
      .from("products")
      .select("id, instock")
      .eq("id", product_id)
      .eq("instock", true) 
      .single()

    if (pErr || !product) throw new HttpError(404, "PRODUCT_NOT_FOUND")
    if (!product.instock) throw new HttpError(409, "PRODUCT_OUT_OF_STOCK")

    // 2. Kiểm tra giỏ hàng hiện có
    const { data: existing, error: findErr } = await supabase
      .from("shopping_carts")
      .select("*")
      .eq("customer_id", customerId)
      .eq("product_id", product_id)
      .maybeSingle()

    if (findErr) throw findErr

    if (existing) {
      //update quantity
      const { data, error } = await supabase
        .from("shopping_carts")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id)
        .select("*")
        .single()
      if (error) throw error
      return data
    } else {
      //insert a new item
      const randomId = generateUUID();
      const { data, error } = await supabase
        .from("shopping_carts")
        .insert({
          id: randomId,
          customer_id: customerId,
          product_id,
          quantity,
        })
        .select("*")
        .single()
      if (error) throw error
      return data
    }
  },
};
