/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: 
# ID: */

import z from "zod";
import { createProductParamsSchema } from "../controllers/productController";
import { supabase, Database } from "../db/db";

import generateUUID from "../utils/generator";

//Dùng "Row" để trả về
export type ProductRow = Database["public"]["Tables"]["products"]["Row"];

//Dùng "Insert" để tạo data
export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];

export type CreateProductInput = z.infer<typeof createProductParamsSchema>;

export type ProductInsertNoId = Omit<ProductInsert, "id">;


export type ProductsFilters = {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  name?: string;
}

export type Pagination = {
  page: number;
  size: number;
}

export const ProductService = {
  async getProducts(
    { page, size }: Pagination,
    filters?: ProductsFilters,
  ): Promise<ProductRow[] | null> {
    const offset = (page - 1) * size;

    const query = supabase
      .from("products")
      .select("*")
      .range(offset, offset + size - 1)
      .order("id", { ascending: false });

    if (filters?.category) {
      query.eq('category', filters?.category); // WHERE category = {category}
    }

    if (filters?.priceMin !== undefined) { //no skip 0
      query.gte('price', filters?.priceMin); // WHERE price >= {min}
    }

    if (filters?.priceMax !== undefined) { //no skip 0
      query.lte('price', filters?.priceMax); // WHERE price <= {max}
    }

    if (filters?.name) {
      query.eq('name', filters?.name); // WHERE name = {name}
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
    console.log(data);

    if (!data) {
      return null; // explicitly return null to trigger 404 in route
      // return [];
    }
    return data;
  },

  //Get Product By Id
  async getProductById(id: string): Promise<ProductRow | null> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    console.log("data", data);

    if (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }

    return data || null;
  },

  async createProduct(product: ProductInsertNoId): Promise<ProductRow | null> {
    const toInsert: ProductInsert = { ...product, id: generateUUID() };

    const { data, error } = await supabase
      .from('products')
      .insert(toInsert)
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating product:', error);
      return null;
    }

    return data;
  },
};