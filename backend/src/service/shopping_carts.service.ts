/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Nguyen The Anh
# ID: s3975844*/
import { supabase, Database } from "../db/db";
import generateUUID from "../utils/generator";
import { ImageService } from "./image.service";

export type Pagination = { page: number; size: number };

type productRow = { id: string; price: number }
type cartCustomer = { id: string; product_id: string; quantity: number }

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type CartRow = Database["public"]["Tables"]["shopping_carts"]["Row"];

const IMAGE_BUCKET = "productimages";

class HttpError extends Error { 
  constructor(public status: number, msg: string){ super(msg) } 
}

export type CartItemDetail = {
  id: string;             // id của cart item
  product_id: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  image: string | null;
};

export const ShoppingCartService = {
  async getCart({ page, size }: { page: number; size: number },customerId: string): Promise<CartItemDetail[] | null> {
    const offset = (page - 1) * size;

    if (!customerId) return []; 
    // take item related to customerid
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

    const items: CartRow[] = data ?? [];
    if (items.length === 0) return [];

    //take the product information ("id, name, price, image")
    const productIds = [...new Set(items.map((i) => i.product_id))];
    const { data: products, error: errProduct } = await supabase
      .from("products")
      .select("id, name, price, image")
      .in("id", productIds);

    if (errProduct) {
      console.error("Product read error:", errProduct);
      throw new Error("DB_READ_FAILED");
    }

    const productMap = new Map<string, Pick<ProductRow, "name" | "price" | "image">>();
    (products ?? []).forEach((p) => {
      productMap.set(p.id as string, {
        name: p.name as string,
        price: Number(p.price ?? 0),
        image: (p.image as string) ?? null,
      });
    });

    //create a cartItemDetail to set all the products
    const details: CartItemDetail[] = [];

    for (const i of items as CartRow[]) {
      const p = productMap.get(i.product_id) ?? {
        name: "(unknown product)",
        price: 0,
        image: null as string | null,
      };

      let image: string | null = null;
      if (p.image) {
        const r = await ImageService.getPublicImageUrl(p.image, IMAGE_BUCKET as any);
        image = r.success ? (r.url ?? null) : null;
      }

      const price = Number(p.price ?? 0);
      const quantity = Number(i.quantity ?? 0);

      details.push({
        id: i.id,
        product_id: i.product_id,
        name: p.name,
        quantity,
        price,
        subtotal: price * quantity,
        image,
      });
    }

    return details;
  },
  
  async removeItemById(id: string, customerId: string): Promise<boolean> {
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
    productId: string,
    quantity = 1
  ): Promise<CartRow> {
    // check product instock
    const { data: product, error: pErr } = await supabase
      .from("products")
      .select("id, instock")
      .eq("id", productId)
      .eq("instock", true)
      .maybeSingle();
    if (pErr) throw new Error("DB_READ_FAILED");
    if (!product)  throw new HttpError(404, "PRODUCT_NOT_FOUND_OR_OUT_OF_STOCK");

    // 2) find the product in cart
    const { data: existing, error: shoppingError } = await supabase
      .from("shopping_carts")
      .select("*")
      .eq("customer_id", customerId)
      .eq("product_id", productId)
      .maybeSingle();
    if (shoppingError) throw shoppingError;

    // update or insert the quantity
    if (existing) {
      const { data, error } = await supabase
        .from("shopping_carts")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id)
        .select("*")
        .single();
      if (error) throw error;
      return data!;
    } else {
      const randomId = generateUUID();
      const { data, error } = await supabase
        .from("shopping_carts")
        .insert({
          id: randomId,
          customer_id: customerId,
          product_id: productId,
          quantity,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data!;
    }
  },

  async checkout(customerId: string) {
    //select cart from customer (all items in cart)
    const { data: cart, error: checkoutErr } = await supabase
      .from("shopping_carts")
      .select("id, product_id, quantity")
      .eq("customer_id", customerId)

    if (checkoutErr) throw checkoutErr
    if (!cart || cart.length === 0) throw new Error("Shopping cart is empty")

    // select the price of products in the cart
    const productIds = [...new Set(cart.map(c => c.product_id))]
    const { data: products, error: productError } = await supabase
      .from("products")
      .select("id, price")
      .in("id", productIds)

    if (productError) throw productError
    const prodMap = new Map((products as productRow[]).map(p => [p.id, Number(p.price)]))
    const missing = productIds.filter(id => !prodMap.has(id))
    if (missing.length) throw new Error(`Products not found: ${missing.join(",")}`)

    // calculate total price
    const total = (cart as cartCustomer[]).reduce(
      (sum, it) => sum + (prodMap.get(it.product_id) || 0) * it.quantity,
      0
    )

    // randomly select a distribution hub
    const { data: hubs, error: hubError } = await supabase
      .from("distribution_hubs")
      .select("id")
    if (hubError) throw hubError
    if (!hubs || hubs.length === 0) throw new Error("No distribution hub available")
    const hubId = (hubs[Math.floor(Math.random() * hubs.length)] as { id: string }).id

    //create a new order
    const orderId = generateUUID()
    const { error: orderError } = await supabase.from("orders").insert({
      id: orderId,
      customer_id: customerId,
      hub_id: hubId,
      status: "active",
      total_price: total,
    })
    
    if (orderError) throw orderError

    // create order items
    const items = (cart as cartCustomer[]).map(it => ({
      id: generateUUID(),
      order_id: orderId,
      product_id: it.product_id,
      quantity: it.quantity,
      price_at_order_time: prodMap.get(it.product_id) || 0,
    }))

    const { error: orderItemError } = await supabase.from("order_items").insert(items)
    if (orderItemError) {
      await supabase.from("orders").delete().eq("id", orderId)
      throw orderItemError
    }

    // delete the cart items after checkout
    const { error: shoppingCartError } = await supabase
      .from("shopping_carts")
      .delete()
      .eq("customer_id", customerId)

    if (shoppingCartError) {
      console.warn("Failed to clear cart after checkout:", shoppingCartError)
    }

    return { orderId, hubId, total }
  },
};
