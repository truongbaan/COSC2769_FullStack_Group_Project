import { supabase, type Database } from "../db/db"

type OrderItemsRow = Database["public"]["Tables"]["order_items"]["Row"]
type ProductRow = Database["public"]["Tables"]["products"]["Row"]


export type OrderItemWithProduct = {
  order_id: string
  product_name: string
  quantity: number
  price_at_order_time: number
  line_total: number
}

export const OrderItemService = {
  async getByOrderId(orderId: string): Promise<OrderItemWithProduct[]> {
    // 1) Lấy item theo order_id
    const { data: items, error: errItems } = await supabase
      .from("order_items")
      .select("id, order_id, product_id, quantity, price_at_order_time")
      .eq("order_id", orderId)
      .order("id", { ascending: false })

    if (errItems) throw errItems
    if (!items || items.length === 0) return []

    // 2) Lấy tên sản phẩm cho các product_id liên quan
    const productIds = Array.from(new Set(items.map(i => i.product_id)))
    const { data: prods, error: errProds } = await supabase
      .from("products")
      .select("id, name")
      .in("id", productIds)

    if (errProds) throw errProds
    const nameById = new Map<string, string>(
      (prods ?? []).map((p: Pick<ProductRow, "id" | "name">) => [p.id, p.name ?? ""])
    )

    // 3) Ghép + tính line_total
    return items.map((i: Pick<OrderItemsRow,"order_id"|"product_id"|"quantity"|"price_at_order_time">) => ({
      order_id: i.order_id,
      product_name: nameById.get(i.product_id) ?? "(unknown product)",
      quantity: Number(i.quantity ?? 0),
      price_at_order_time: Number(i.price_at_order_time ?? 0),
      line_total: Number(i.quantity ?? 0) * Number(i.price_at_order_time ?? 0),
    }))
  }
}