import { supabase, Database } from "../db/db";

export type Pagination = { page: number; size: number };

type CartRow = Database["public"]["Tables"]["shopping_carts"]["Row"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];

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
  ): Promise<CartRow[] | null> {
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
    return data ?? null;
  },

  
};
