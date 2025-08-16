/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: 
# ID: */

import { supabase, Database } from "../db/db";

export type Product = Database["public"]["Tables"]["products"]["Row"];

export type ProductsFilters = {
  category?: string;
  priceMin?: number;
  priceMax?: number;
}

export type Pagination = {
  page: number;
  size: number;
}

export const ProductService = {
  async getProducts(
    { page, size }: Pagination,
    filters?: ProductsFilters,
  ): Promise<Product[] | null> {
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

    const { data, error } = await query;

    //DEBUG, will be remove
    console.log("📊 Raw Supabase response:");
    console.log("  - Data:", data);
    console.log("  - Error:", error);
    console.log("  - Data length:", data?.length);

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
  async getProductById(id: string): Promise<Product | null> {
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

  async createProduct(product: {
    name: string;
    price: number;
    image: string;
    description: string;
    category?: string;
    id?: string;              // random
  }): Promise<Product | null> {
    // Validate
    if (product.name.length < 10 || product.name.length > 20) {
      console.error("Name must be 10–20 characters.");
      return null;
    }
    if (product.price <= 0) {
      console.error("Price must be a positive number.");
      return null;
    }
    if (product.description && product.description.length > 500) {
      console.error("Description must be at most 500 characters.");
      return null;
    }

    // Generate ID if not injected
    const id =
      product.id ??
      (globalThis.crypto?.randomUUID
        ? globalThis.crypto.randomUUID()
        : require("crypto").randomUUID()); // fallback for Node

    const { data, error } = await supabase
      .from("products")
      .insert({
        name: product.name,
        price: product.price,
        image: product.image,
        description: product.description || null
      })
      .select()
      .maybeSingle();

    if (error || !data) {
      console.error("Error creating product:", error);
      return null;
    }

    return data as Product;
  },
};