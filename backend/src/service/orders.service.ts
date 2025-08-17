import { supabase, Database } from "../db/db";

export type Order = Database["public"]["Tables"]["orders"]["Row"];

export type Pagination = {
  page: number;
  size: number;
};

export const OrderService = {
  // Lấy đơn theo đúng hub hiện tại (controller truyền vào)
  async getOrders(
    { page, size }: Pagination,
    hubId: string
  ): Promise<Order[] | null> {
    const offset = (page - 1) * size;

    // Nếu controller chưa xác định được hub thì trả mảng rỗng (không lỗi)
    if (!hubId) {
      return [];
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("hub_id", hubId)
      .eq("status", "active")
      .order("id", { ascending: false })
      .range(offset, offset + size - 1);

    if (error) {
      console.error("Error fetching order:", error);
      throw error;
    }

    return data ?? null;
  },
};